const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { fintechService } = require('../services');

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

module.exports = {
  reserveOrder,
  createOrder,
  processKYC,
};
