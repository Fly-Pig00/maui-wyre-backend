const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { fintechService } = require('../services');
const { User, PayMethod } = require('../models');
const fs = require('fs/promises');
const FormData = require('form-data');

const reserveOrder = catchAsync(async (req, res) => {
  const { amount, paymentMethod, sourceCurrency, destCurrency } = req.body;

  const response = await fintechService.orderReservation(
    sourceCurrency,
    destCurrency,
    req.user.btcWalletAddr,
    req.user.ethWalletAddr,
    req.user.userId,
    amount,
    paymentMethod
  );

  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const reserveOrderForFiat = catchAsync(async (req, res) => {
  const { amount, paymentMethod, sourceCurrency, destCurrency } = req.body;

  const response = await fintechService.orderReservationForFiat(
    sourceCurrency,
    destCurrency,
    req.user.ethWalletAddr,
    req.user.userId,
    amount,
    paymentMethod
  );

  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const createOrder = catchAsync(async (req, res) => {
  const {
    isFiat,
    sourceCurrency,
    destCurrency,
    number,
    year,
    month,
    cvv,
    reservationId,
    amount,
    street1,
    city,
    state,
    postalCode,
    country,
    givenName,
    familyName,
    email,
    phone,
  } = req.body;
  const response = await fintechService.createOrder(
    isFiat,
    sourceCurrency,
    destCurrency,
    number,
    year,
    month,
    cvv,
    reservationId,
    amount,
    street1,
    city,
    state,
    postalCode,
    country,
    givenName,
    familyName,
    email,
    phone,
    req.user.btcWalletAddr,
    req.user.ethWalletAddr,
    req.user.userId
  );
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const processKYC = catchAsync(async (req, res) => {
  const response = await fintechService.getKYCUrl(req.user.userId);
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const withdrawFromFiat = catchAsync(async (req, res) => {
  const { srn, sourceAmount, sourceCurrency, destCurrency } = req.body;
  const response = await fintechService.withdrawFromFiat(srn, sourceAmount, sourceCurrency, destCurrency, req.user.userId);
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const getFiatFromPaymethod = catchAsync(async (req, res) => {
  const { srn, sourceAmount, sourceCurrency, destCurrency } = req.body;
  const response = await fintechService.getFiatFromPaymentMethod(
    srn,
    sourceAmount,
    sourceCurrency,
    destCurrency,
    req.user.userId
  );
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const withdrawFromCrypto = catchAsync(async (req, res) => {
  const { srn, sourceAmount, sourceCurrency, destCurrency } = req.body;
  const response = await fintechService.withdrawFromCrypto(
    srn,
    sourceAmount,
    sourceCurrency,
    destCurrency,
    req.user.ethWalletAddr
  );
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const getCrytpFromPaymethod = catchAsync(async (req, res) => {
  const { srn, sourceAmount, sourceCurrency, destCurrency } = req.body;
  const response = await fintechService.getCryptoFromPaymentMethod(
    srn,
    sourceAmount,
    sourceCurrency,
    destCurrency,
    req.user.ethWalletAddr
  );
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const transferAsset = catchAsync(async (req, res) => {
  const { method, recipient, sourceAmount, sourceCurrency, destCurrency } = req.body;
  // if(method==="user")
  let destUser;
  console.log(method);
  if (method === 'user') {
    destUser = await User.findOne({ email: recipient });
    console.log(destUser);
    if (!destUser) res.status(httpStatus.BAD_REQUEST).send({ msg: 'Not registered User' });
  }
  const response = await fintechService.transferAsset(
    method,
    sourceAmount,
    sourceCurrency,
    destCurrency,
    method === 'user' ? destUser.userId : recipient,
    req.user.userId
  );
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const getHistory = catchAsync(async (req, res) => {
  const response = await fintechService.getHistory(req.user.userId);
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const createBankPayMethod = catchAsync(async (req, res) => {
  const {
    firstNameOnAccount,
    lastNameOnAccount,
    beneficiaryAddress,
    beneficiaryCity,
    beneficiaryPostal,
    beneficiaryPhoneNumber,
    beneficaryState,
    beneficiaryDobDay,
    beneficiaryDobMonth,
    beneficiaryDobYear,
    accountNumber,
    routingNumber,
    accountType,
  } = req.body;

  const response = await fintechService.createPaymentMethod(
    firstNameOnAccount,
    lastNameOnAccount,
    beneficiaryAddress,
    beneficiaryCity,
    beneficiaryPostal,
    beneficiaryPhoneNumber,
    beneficaryState,
    beneficiaryDobDay,
    beneficiaryDobMonth,
    beneficiaryDobYear,
    accountNumber,
    routingNumber,
    accountType
  );

  if (response.status === 'success') {
    const payMethod = new PayMethod({
      name: response.data.name,
      srn: response.data.srn.split(':')[1],
    });
    await payMethod
      .save()
      .then((method) => {
        User.findById(req.user.id)
          .then((user) => {
            user.payMethods.push(method._id);
            user
              .save()
              .then(() => {
                res.send({ ...response.data, payId: method._id });
              })
              .catch(() => {
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ msg: 'DB save of user info fails' });
              });
          })
          .catch(() => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ msg: 'No such a usr data' });
          });
      })
      .catch(() => {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ msg: 'DB save of pay info fails' });
      });
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const deletePayMethod = catchAsync(async (req, res) => {
  const { srn } = req.body;
  const response = await fintechService.removePaymentMethod(srn);

  if (response.status === 'success') {
    await PayMethod.findOneAndDelete({ srn }).then((payMethod) => {
      User.findById(req.user.id).then((user) => {
        const filteredPayMethods = user.payMethods.filter((item) => {
          return item.toString() !== payMethod._id.toString();
        });

        user
          .save({ ...user, payMethods: filteredPayMethods })
          .then(() => res.status(httpStatus.OK).send({ msg: 'success' }));
      });
    });
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const getPayMethods = catchAsync(async (req, res) => {
  let payMethodInfo = [];

  const user = await User.findById(req.user.id);
  const promise = user.payMethods.map(async (payMethodId) => {
    const payMethod = await PayMethod.findById(payMethodId);

    if (!payMethod) return null;

    const status = await fintechService.getPayMethodStatus(payMethod.srn);

    payMethodInfo.push({ id: payMethod._id, name: payMethod.name, srn: payMethod.srn, status });
  });

  await Promise.all(promise);
  res.send(payMethodInfo);
});

const uploadDoc = catchAsync(async (req, res) => {
  const file = req.file;
  console.log(req.file);
  const { srn } = req.body;
  console.log('file: ', file);
  const uploadedFile = await fs.readFile(file.path);
  const form = new FormData();
  // form.append('document', file, {
  //   'content-type': 'application/pdf',
  // });

  const response = await fintechService.uploadBankDoc(srn, file);
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const getBalance = catchAsync(async (req, res) => {
  const response = await fintechService.getBalances(req.user.userId);
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const getUserInfo = catchAsync(async (req, res) => {
  const wyreUser = await fintechService.getWyreUserInfo(req.user.userId);
  if (wyreUser.status === 'error') {
    res.status(httpStatus.BAD_REQUEST).send(wyreUser.data);
    return;
  }

  res.send({ user: req.user, wyreUser: wyreUser.data });
});

const plaidCreateToken = catchAsync(async (req, res) => {
  const response = await fintechService.createPlaidToken(req.user.id);
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const plaidCreatePublicToken = catchAsync(async (req, res) => {
  const { publicToken } = req.body;
  const response = await fintechService.createPlaidPublicToken(publicToken);
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

module.exports = {
  reserveOrder,
  reserveOrderForFiat,
  createOrder,
  processKYC,
  createBankPayMethod,
  getFiatFromPaymethod,
  withdrawFromCrypto,
  withdrawFromFiat,
  getPayMethods,
  transferAsset,
  uploadDoc,
  deletePayMethod,
  getCrytpFromPaymethod,
  getHistory,
  getBalance,
  getUserInfo,
  plaidCreateToken,
  plaidCreatePublicToken,
};
