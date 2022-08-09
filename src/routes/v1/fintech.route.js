const express = require('express');
const auth = require('../../middlewares/auth');
const fintechController = require('../../controllers/fintech.controller');
const fintechValidation = require('../../validations/fintech.validation');
const validate = require('../../middlewares/validate');
const multer = require('multer');
const upload = multer({ dest: 'uploads' });

const router = express.Router();

router.route('/reserve').post(auth(), validate(fintechValidation.reserveOrder), fintechController.reserveOrder);

router.route('/order').post(auth(), fintechController.createOrder);

router
  .route('/createpaymethod')
  .post(auth(), validate(fintechValidation.createBankPayMethod), fintechController.createBankPayMethod);

router.route('/deletepaymethod').post(auth(), fintechController.deletePayMethod);

router.route('/fiatfrombank').post(auth(), fintechController.getFiatFromPaymethod);

router.route('/cryptofrombank').post(auth(), fintechController.getCrytpFromPaymethod);

router.route('/withdrawfromcrypto').post(auth(), fintechController.withdrawFromCrypto);

router.route('/withdrawfromfiat').post(auth(), fintechController.withdrawFromFiat);

router.route('/transferasset').post(auth(), fintechController.transferAsset);

router.route('/uploaddoc').post(upload.single('bankdoc'), fintechController.uploadDoc);

router.route('/kyc').get(auth(), fintechController.processKYC);

router.route('/getpaymethods').get(auth(), fintechController.getPayMethods);

router.route('/balances').get(auth(), fintechController.getBalance);

router.route('/userinfo').get(auth(), fintechController.getUserInfo);

router.route('/gethistory').get(auth(), fintechController.getHistory);

router.route('/plaidtoken').get(auth(), fintechController.plaidCreateToken);

router.route('/plaid_public_token').get(auth(), fintechController.plaidCreatePublicToken);

module.exports = router;
