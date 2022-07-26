const express = require('express');
const auth = require('../../middlewares/auth');
const fintechController = require('../../controllers/fintech.controller');
const fintechValidation = require('../../validations/fintech.validation');
const validate = require('../../middlewares/validate');

const router = express.Router();

router.route('/reserve').post(auth(), validate(fintechValidation.reserveOrder), fintechController.reserveOrder);

router.route('/order').post(auth(), fintechController.createOrder);

router.route('/kyc').get(auth(), fintechController.processKYC);

module.exports = router;
