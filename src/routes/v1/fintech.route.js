const express = require('express');
const auth = require('../../middlewares/auth');
const fintechController = require('../../controllers/fintech.controller');
const fintechValidation = require('../../validations/fintech.validation');
const validate = require('../../middlewares/validate');

const router = express.Router();

router.route('/reserve').post(auth(), validate(fintechValidation.reserveOrder), fintechController.reserveOrder);

router.route('/order').post(auth(), fintechController.createOrder);

router
  .route('/createpaymethod')
  .post(auth(), validate(fintechValidation.transferFromBankAccount), fintechController.createBankPayMethod);

router.route('/deletepaymethod').post(auth(), fintechController.deletePayMethod);

router.route('/fiatfrombank').post(auth(), fintechController.getFiatFromPaymethod);

router.route('/cryptofrombank').post(auth(), fintechController.getCrytpFromPaymethod);

router.route('/uploaddoc').post(auth(), fintechController.uploadDoc);

router.route('/kyc').get(auth(), fintechController.processKYC);

router.route('/getpaymethods').get(auth(), fintechController.getPayMethods);

router.route('/balances').get(auth(), fintechController.getBalance);

router.route('/userinfo').get(auth(), fintechController.getUserInfo);

module.exports = router;
