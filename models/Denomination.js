const mongoose = require('mongoose');

const denominationSchema = new mongoose.Schema({
  RS_2000: Number,
  RS_500: Number,
  RS_200: Number,
  RS_100: Number,
  RS_50: Number,
  RS_20: Number,
  RS_10: Number,
  RS_5: Number,
  RS_2: Number,
  RS_1: Number,
  Total_Amount: Number,
  Total_Number_of_Notes: Number,
  Created_On: Date,
  Updated_On: Date
});

module.exports = mongoose.model('Denomination', denominationSchema);
