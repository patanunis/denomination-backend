const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  Employee_ID: { type: String, unique: true },
  Emp_Name: String,
  Role: { type: String, enum: ['Employee', 'Admin'], required: true },
  Mobile_No: Number,
  Password: String,
  Email_ID: { type: String, unique: true }
});

// Auto-generate Employee_ID before saving
employeeSchema.pre('save', async function (next) {
  if (this.Employee_ID) return next(); // Skip if already set

  const prefix = this.Role === 'Admin' ? 'ADM' : 'EMP';

  const count = await mongoose.model('Employee').countDocuments({ Role: this.Role });
  const nextNumber = (count + 1).toString().padStart(3, '0');

  this.Employee_ID = `${prefix}${nextNumber}`;
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
