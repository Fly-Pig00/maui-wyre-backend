const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { fintechService } = require('../services');
const { User, PayMethod } = require('../models');

const reserveOrder = catchAsync(async (req, res) => {
  const { amount, paymentMethod } = req.body;

  const response = await fintechService.orderReservation(req.user.ethWalletAddr, req.user.userId, amount, paymentMethod);

  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const createOrder = catchAsync(async (req, res) => {
  const {
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
    req.user.ethWalletAddr
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

const transferFromPaymethod = catchAsync(async (req, res) => {
  const { srn, sourceAmount, sourceCurrency } = req.body;
  const response = await fintechService.transferFromPaymentMethod(srn, sourceAmount, sourceCurrency, req.user.userId);
  if (response.status === 'success') {
    res.send(response.data);
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ msg: response.data });
  }
});

const getCrytpFromPaymethod = catchAsync(async (req, res) => {
  const { srn, sourceAmount, sourceCurrency } = req.body;
  const response = await fintechService.getCryptoFromPaymentMethod(
    srn,
    sourceAmount,
    sourceCurrency,
    req.user.ethWalletAddr
  );
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
  const { paymentMethodId } = req.body;
  const response = await fintechService.uploadBankDoc(paymentMethodId);
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

module.exports = {
  reserveOrder,
  createOrder,
  processKYC,
  createBankPayMethod,
  transferFromPaymethod,
  getPayMethods,
  uploadDoc,
  deletePayMethod,
  getCrytpFromPaymethod,
  getBalance,
};
