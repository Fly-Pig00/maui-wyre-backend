const express = require('express');
const auth = require('../../middlewares/auth');
const plaidController = require('../../controllers/plaid.controller');

const router = express.Router();

router.route('/create_link_token').post(plaidController.createLinkToken);
router.post('/set_processor_token', auth(), plaidController.setProcessorToken);

module.exports = router;
