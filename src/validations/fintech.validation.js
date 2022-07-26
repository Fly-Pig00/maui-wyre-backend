const Joi = require('joi');

const reserveOrder = {
  body: Joi.object().keys({
    amount: Joi.number().min(0).required(),
    paymentMethod: Joi.number().required().min(0).max(2),
  }),
};

module.exports = {
  reserveOrder,
};
