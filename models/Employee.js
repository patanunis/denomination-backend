const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  Employee_ID: String,
  Emp_Name: String,
  Role: { type: String, enum: ['Employee', 'Admin'] },
  Mobile_No: Number,
  Password: String,
  Email_ID: String
});

module.exports = mongoose.model('Employee', employeeSchema);
