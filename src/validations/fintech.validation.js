const Joi = require('joi');

const reserveOrder = {
  body: Joi.object().keys({
    amount: Joi.number().min(0).required(),
    paymentMethod: Joi.number().required().min(0).max(2),
  }),
};

const transferFromBankAccount = {
  body: Joi.object().keys({
    firstNameOnAccount: Joi.string().required(),
    lastNameOnAccount: Joi.string().required(),
    beneficiaryAddress: Joi.string().required(),
    beneficiaryCity: Joi.string().required(),
    beneficiaryPostal: Joi.string().required(),
    beneficiaryPhoneNumber: Joi.string()
      .pattern(/^[+]?[0-9]+$/)
      .required(),
    beneficaryState: Joi.string().required(),
    beneficiaryDobDay: Joi.number().min(1).max(31).required(),
    beneficiaryDobMonth: Joi.number().min(1).max(12).required(),
    beneficiaryDobYear: Joi.number().min(1900).max(2050).required(),
    accountNumber: Joi.string()
      .pattern(/^[0-9]+$/)
      .required(),
    routingNumber: Joi.string()
      .pattern(/^[0-9]+$/)
      .required(),
    accountType: Joi.number().min(0).max(1).required(),
  }),
};

module.exports = {
  reserveOrder,
  transferFromBankAccount,
};
