const Employee = require('../models/Employee');
const generateID = require('../utils/generateID');

exports.register = async (req, res) => {
  const { Emp_Name, Role, Mobile_No, Password, Email_ID } = req.body;
  const Employee_ID = generateID(Role);
  const newEmp = new Employee({ Employee_ID, Emp_Name, Role, Mobile_No, Password, Email_ID });
  await newEmp.save();
  res.status(201).json({ message: 'Registered successfully', Employee_ID });
};

exports.login = async (req, res) => {
  const { Role, Email_ID, Password } = req.body;
  const user = await Employee.findOne({ Role, Email_ID, Password });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ message: 'Login successful', user });
};

exports.forgotPassword = async (req, res) => {
  const { Email_ID, newPassword } = req.body;
  const user = await Employee.findOneAndUpdate({ Email_ID }, { Password: newPassword });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'Password updated successfully' });
};
