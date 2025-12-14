const mongoose = require('mongoose');
const dotenv = require('dotenv');
const teacherModel = require('../models/teacherModel');
const userModel = require('../models/userModel');
const appointmentModel = require('../models/appointmentModel');

const fs = require('fs');
const { dirname } = require('path');

dotenv.config({ path: '../.env' });

// Connect to MongoDB

mongoose.connect(process.env.DATABASE)
  .then(() => console.log('Connected to database successfully'))
  .catch(err => console.error('Database connection error:', err));

// Load appointments data from JSON
const appointments = JSON.parse(
  fs.readFileSync(`${__dirname}/appointments.json`, 'utf-8')
);

// Import appointments data
const importData = async () => {
  try {
    await appointmentModel.create(appointments, { validateBeforeSave: false });
    console.log('Appointments imported successfully');
  } catch (err) {
    console.error('Import error:', err.message);
  }
  process.exit();
};

// Delete all appointments
const deleteAllData = async () => {
  try {
    await appointmentModel.deleteMany();
    console.log('All appointments deleted');
  } catch (err) {
    console.error('Delete error:', err.message);
  }
  process.exit();
};

// Update user images for all students
const updateStudentImages = async () => {
  try {
    const result = await userModel.updateMany(
      { role: 'student' }, // filter student users (adjust as needed)
      { image: 'image.png' }
    );
  } catch (err) {
    console.error('Update images error:', err.message);
  }
  process.exit();
};

// Determine operation based on CLI flag
const flag = process.argv[2];
if (flag === '--import') {
  importData();
} else if (flag === '--delete') {
  deleteAllData();
} else if (flag === '--update-images') {
  updateStudentImages();
} else {
  console.log('Usage: node script.js [--import|--delete|--update-images]');
  process.exit();
}
