const axios = require('axios');
const config = require('../config/config');

const getWyreUserInfo = async (userId) => {
  let response;
  await axios({
    method: 'GET',
    headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
    url: `${config.wyre.url}/v3/users/${userId}`,
  })
    .then((res) => {
      response = { status: 'success', data: res.data };
    })
    .catch((err) => {
      response = { status: 'error', data: err.response.data.message };
    });

  return response;
};

const orderReservation = async (sourceCurrency, destCurrency, ethWalletAddr, userId, sourceAmount, paymentMethod) => {
  let payMethod;
  if (paymentMethod === 0) {
    payMethod = 'debit-card';
  } else if (paymentMethod === 1) {
    payMethod = 'ach-transfer';
  } else {
    payMethod = 'apple-pay';
  }

  const input = {
    sourceAmount,
    paymentMethod: payMethod,
    amountIncludeFees: true,
    sourceCurrency,
    destCurrency,
    referrerAccountId: config.wyre.referrerAccountId,
    dest: `ethereum:${ethWalletAddr}`,
    country: 'US',
    owner: `user:${userId}`,
  };

  let response;
  await axios({
    method: 'POST',
    data: input,
    headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
    url: `${config.wyre.url}/v3/orders/reserve`,
  })
    .then((res) => {
      response = { status: 'success', data: res.data };
    })
    .catch((err) => {
      response = { status: 'error', data: err.response.data.message };
    });

  return response;
};

const createOrder = async (
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
  ethWalletAddr
) => {
  const input = {
    debitCard: {
      number,
      year,
      month,
      cvv,
    },
    reservationId,
    amount,
    sourceCurrency: sourceCurrency,
    destCurrency: destCurrency,
    dest: `ethereum:${ethWalletAddr}`,
    referrerAccountId: config.wyre.referrerAccountId,
    givenName,
    familyName,
    email,
    ipAddress: '0.0.0.0',
    referenceId: config.wyre.referrerAccountId,
    phone,
    address: {
      street1,
      city,
      state,
      postalCode,
      country,
    },
  };
  let response;

  await axios({
    method: 'POST',
    data: input,
    headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
    url: `${config.wyre.url}/v3/debitcard/process/partner`,
  })
    .then((res) => {
      response = { status: 'success', data: res.data };
    })
    .catch((err) => {
      response = { status: 'error', data: err.response.data.message };
    });

  return response;
};

const createWyreUser = async () => {
  const input = {
    blockchains: ['ETH'],
  };
  const response = await axios({
    method: 'POST',
    data: input,
    headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
    url: 'https://api.testwyre.com/v3/users',
  });
  return response.data;
};

const getKYCUrl = async (userId) => {
  let response;
  await axios({
    method: 'GET',
    headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
    url: `${config.wyre.url}/v3/users/${userId}/onboarding`,
  })
    .then((res) => {
      response = { status: 'success', data: res.data };
    })
    .catch((err) => {
      response = { status: 'error', data: err.response.data.message };
    });

  return response;
};

const createPaymentMethod = async (
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
) => {
  const input = {
    paymentMethodType: 'INTERNATIONAL_TRANSFER',
    paymentType: 'LOCAL_BANK_WIRE',
    currency: 'USD',
    country: 'US',
    beneficiaryType: 'INDIVIDUAL',
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
    accountType: accountType === 0 ? 'CHECKING' : 'SAVINGS',
    chargeablePM: false,
  };

  let response;
  await axios({
    method: 'POST',
    headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
    url: `${config.wyre.url}/v2/paymentMethods`,
    data: input,
  })
    .then((res) => {
      response = { status: 'success', data: res.data };
    })
    .catch((err) => {
      response = { status: 'error', data: err.response.data.message };
    });

  return response;
};

const removePaymentMethod = async (srn) => {
  let response;
  await axios({
    method: 'DELETE',
    headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
    url: `${config.wyre.url}/v2/paymentMethod/${srn}`,
  })
    .then((res) => {
      response = { status: 'success', data: res.data };
    })
    .catch((err) => {
      response = { status: 'error', data: err.response.data.message };
    });

  return response;
};

const getFiatFromPaymentMethod = async (srn, sourceAmount, sourceCurrency, destCurrency, userId) => {
  const input = {
    source: `paymentmethod:${srn}`,
    dest: `user:${userId}`,
    sourceCurrency,
    destCurrency,
    sourceAmount,
    autoConfirm: true,
  };
  let response;
  await axios({
    method: 'POST',
    headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
    url: `${config.wyre.url}/v3/transfers`,
    data: input,
  })
    .then((res) => {
      response = { status: 'success', data: res.data };
    })
    .catch((err) => {
      response = { status: 'error', data: err.response.data.message };
    });

  return response;
};

const getCryptoFromPaymentMethod = async (srn, sourceAmount, sourceCurrency, destCurrency, ethWalletAddr) => {
  const input = {
    source: `paymentmethod:${srn}`,
    dest: `ethereum:${ethWalletAddr}`,
    sourceCurrency,
    destCurrency,
    sourceAmount,
    autoConfirm: true,
  };
  let response;
  await axios({
    method: 'POST',
    headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
    url: `${config.wyre.url}/v3/transfers`,
    data: input,
  })
    .then((res) => {
      response = { status: 'success', data: res.data };
    })
    .catch((err) => {
      response = { status: 'error', data: err.response.data.message };
    });

  return response;
};

const getPayMethodStatus = async (srn) => {
  const status = await axios({
    method: 'GET',
    headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
    url: `${config.wyre.url}/v2/paymentMethod/${srn}`,
  });

  return status.data.status;
};

const uploadBankDoc = async (srn, formData) => {
  let response;
  await axios
    .post({
      method: 'POST',
      headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
      url: `${config.wyre.url}/v2/paymentMethod/${srn}/followup`,
      formData,
    })
    .then((res) => {
      response = { status: 'success', data: res.data };
    })
    .catch((err) => {
      response = { status: 'error', data: err.response.data.message };
    });

  return response;
};

const getBalances = async (userId) => {
  let response;
  await axios({
    method: 'GET',
    headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
    url: `${config.wyre.url}/v3/users/${userId}`,
  })
    .then((res) => {
      response = { status: 'success', data: res.data.totalBalances };
    })
    .catch((err) => {
      response = { status: 'error', data: err.response.data.message };
    });

  return response;
};

module.exports = {
  getWyreUserInfo,
  orderReservation,
  createOrder,
  createWyreUser,
  getKYCUrl,
  createPaymentMethod,
  getFiatFromPaymentMethod,
  getCryptoFromPaymentMethod,
  getPayMethodStatus,
  uploadBankDoc,
  removePaymentMethod,
  getBalances,
};
