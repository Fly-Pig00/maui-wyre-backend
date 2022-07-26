const axios = require('axios');
const config = require('../config/config');

const getWyreUserInfo = async (userId) => {
  const response = await axios({
    method: 'GET',
    headers: { Authorization: `Bearer ${config.wyre.secretKey}` },
    url: `${config.wyre.url}/v3/users/${userId}`,
  });
  return response.data;
};

const orderReservation = async (ethWalletAddr, userId, sourceAmount, paymentMethod) => {
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
    sourceCurrency: 'USD',
    destCurrency: 'DAI',
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
    sourceCurrency: 'USD',
    destCurrency: 'DAI',
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

module.exports = {
  getWyreUserInfo,
  orderReservation,
  createOrder,
  createWyreUser,
  getKYCUrl,
};
