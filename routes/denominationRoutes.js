const express = require('express');
const router = express.Router();
const {
  createDenomination,
  viewDenominations,
  depositCalculator
} = require('../controllers/denominationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createDenomination);
router.get('/', authMiddleware, viewDenominations);
router.post('/deposit', authMiddleware, depositCalculator);

module.exports = router;
