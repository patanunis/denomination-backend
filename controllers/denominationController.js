console.log("DEBUG: denominationController.js loaded");

const Denomination = require('../models/Denomination');

async function createDenomination(req, res) {
  try {
    const data = req.body;

    const Total_Amount = Object.entries(data)
      .filter(([key]) => key.startsWith('RS_'))
      .reduce((sum, [key, value]) => {
        const denom = parseInt(key.split('_')[1]);
        return sum + denom * (parseInt(value) || 0);
      }, 0);

    const Total_Number_of_Notes = Object.entries(data)
      .filter(([key]) => key.startsWith('RS_'))
      .reduce((sum, [, value]) => sum + (parseInt(value) || 0), 0);

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
    console.error('❌ Save error:', error);
    res.status(500).json({ error: 'Failed to save denomination', details: error.message });
  }
}

async function viewDenominations(req, res) {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date('2000-01-01');
    const to = req.query.to ? new Date(req.query.to) : new Date();

    const entries = await Denomination.find({
      Created_On: { $gte: from, $lte: to }
    });

    const summary = entries.reduce((acc, curr) => {
      acc.Total_Amount += curr.Total_Amount || 0;
      acc.Total_Notes += curr.Total_Number_of_Notes || 0;
      return acc;
    }, { Total_Amount: 0, Total_Notes: 0 });

    res.json({ entries, summary });
  } catch (error) {
    console.error('❌ Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch denominations', details: error.message });
  }
}

async function depositCalculator(req, res) {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date('2000-01-01');
    const to = req.query.to ? new Date(req.query.to) : new Date();

    const entries = await Denomination.find({
      Created_On: { $gte: from, $lte: to }
    });

    let RS_500 = 0, RS_200 = 0, RS_100 = 0;

    entries.forEach(entry => {
      RS_500 += entry.RS_500 || 0;
      RS_200 += entry.RS_200 || 0;
      RS_100 += entry.RS_100 || 0;
    });

    const totalAmount = RS_500 * 500 + RS_200 * 200 + RS_100 * 100;
    const totalNotes = RS_500 + RS_200 + RS_100;

    // ✅ Step 1: Round down to nearest value ending in ₹200
    let roundedAmount = totalAmount;
    while (roundedAmount % 1000 !== 200 && roundedAmount > 0) {
      roundedAmount -= 100;
    }

    // ✅ Step 2: Find valid combination to match roundedAmount
    let bestCombo = null;

    for (let f = 0; f <= RS_500; f++) {
      for (let t = 0; t <= RS_200; t++) {
        for (let h = 0; h <= RS_100; h++) {
          const sum = f * 500 + t * 200 + h * 100;
          if (sum === roundedAmount) {
            bestCombo = { RS_500: f, RS_200: t, RS_100: h };
            break;
          }
        }
        if (bestCombo) break;
      }
      if (bestCombo) break;
    }

    if (!bestCombo) {
      return res.status(400).json({ error: 'No valid combination found to match rounded deposit amount' });
    }

    const usedAmount = bestCombo.RS_500 * 500 + bestCombo.RS_200 * 200 + bestCombo.RS_100 * 100;
    const usedNotes = bestCombo.RS_500 + bestCombo.RS_200 + bestCombo.RS_100;

    const remainingAmount = totalAmount - usedAmount;
    const remainingNotes = totalNotes - usedNotes;

    // ✅ Format combo and remaining notes
    const comboBreakdown = Object.entries(bestCombo)
      .filter(([_, count]) => count > 0)
      .map(([denom, count]) => `${denom} × ${count}`);

    const remainingBreakdown = {
      RS_500: RS_500 - bestCombo.RS_500,
      RS_200: RS_200 - bestCombo.RS_200,
      RS_100: RS_100 - bestCombo.RS_100
    };

    const filteredRemaining = Object.entries(remainingBreakdown)
      .filter(([_, count]) => count > 0)
      .map(([denom, count]) => `${denom} × ${count}`);

    // ✅ Final response
    res.json({
      totalAmount,
      totalNotes,
      roundedAmount: usedAmount,
      combo: comboBreakdown,
      remainingAmount,
      remainingNotes,
      remainingBreakdown: filteredRemaining
    });
  } catch (error) {
    console.error('❌ Deposit calc error:', error);
    res.status(500).json({ error: 'Failed to calculate deposit', details: error.message });
  }
}




console.log("DEBUG: Exporting route handlers");

module.exports = {
  createDenomination,
  viewDenominations,
  depositCalculator
};
