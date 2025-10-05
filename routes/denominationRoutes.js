const express = require('express');
const router = express.Router();

const denominationController = require('../controllers/denominationController.js');

console.log("DEBUG: Route handlers loaded:", denominationController);

router.post('/create', denominationController.createDenomination);
router.get('/view', denominationController.viewDenominations);
router.get('/deposit', denominationController.depositCalculator);

module.exports = router;
