console.log("DEBUG: denominationController.js loaded");

const Denomination = require('../models/Denomination');

async function createDenomination(req, res) {
  try {
    const data = req.body;

    const Total_Amount = Object.entries(data)
      .filter(([key]) => key.startsWith('RS_'))
      .reduce((sum, [key, value]) => {
        const denom = parseInt(key.split('_')[1]);
        return sum + denom * value;
      }, 0);

    const Total_Number_of_Notes = Object.entries(data)
      .filter(([key]) => key.startsWith('RS_'))
      .reduce((sum, [, value]) => sum + value, 0);

    const entry = new Denomination({
      ...data,
      Total_Amount,
      Total_Number_of_Notes,
      Created_On: new Date(),
      Updated_On: new Date()
    });

    await entry.save();
    res.status(201).json({ message: 'Denomination saved', entry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save denomination', details: error.message });
  }
}

async function viewDenominations(req, res) {
  try {
    const { from, to } = req.query;

    const entries = await Denomination.find({
      Created_On: { $gte: new Date(from), $lte: new Date(to) }
    });

    const summary = entries.reduce((acc, curr) => {
      acc.Total_Amount += curr.Total_Amount;
      acc.Total_Notes += curr.Total_Number_of_Notes;
      return acc;
    }, { Total_Amount: 0, Total_Notes: 0 });

    res.json({ entries, summary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch denominations', details: error.message });
  }
}

async function depositCalculator(req, res) {
  try {
    const { from, to } = req.query;

    const entries = await Denomination.find({
      Created_On: { $gte: new Date(from), $lte: new Date(to) }
    });

    let totalAmount = 0;
    let totalNotes = 0;
    let RS_500 = 0, RS_200 = 0, RS_100 = 0;

    entries.forEach(entry => {
      RS_500 += entry.RS_500 || 0;
      RS_200 += entry.RS_200 || 0;
      RS_100 += entry.RS_100 || 0;
    });

    totalAmount = RS_500 * 500 + RS_200 * 200 + RS_100 * 100;
    totalNotes = RS_500 + RS_200 + RS_100;

    const roundedAmount = totalAmount - (totalAmount % 200);
    let remaining = roundedAmount;
    const combo = {};

    combo.RS_500 = Math.min(RS_500, Math.floor(remaining / 500));
    remaining -= combo.RS_500 * 500;

    combo.RS_200 = Math.min(RS_200, Math.floor(remaining / 200));
    remaining -= combo.RS_200 * 200;

    combo.RS_100 = Math.min(RS_100, Math.floor(remaining / 100));

    res.json({ totalAmount, totalNotes, roundedAmount, combo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate deposit', details: error.message });
  }
}

console.log("DEBUG: Exporting route handlers");

module.exports = {
  createDenomination,
  viewDenominations,
  depositCalculator
};
