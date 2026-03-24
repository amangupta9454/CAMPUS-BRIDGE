const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const createTimetable = async (req, res) => {
  try {
    const { subjects } = req.body; // Expect an array of subjects
    
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one subject' });
    }
    
    if (subjects.length > 6) {
      return res.status(400).json({ success: false, message: 'You can only add up to 6 subjects at a time' });
    }

    const currentDate = new Date();
    const tenDaysFromNow = new Date(currentDate.setDate(currentDate.getDate() + 10));
    const createdTimetables = [];

    // Validation loop
    for (const sub of subjects) {
      const examDate = new Date(sub.date);
      if (examDate < tenDaysFromNow) {
        return res.status(400).json({ success: false, message: `Exam for ${sub.subjectName} must be scheduled at least 10 days from current date` });
      }
    }

    // Creation loop
    for (const sub of subjects) {
      const examDate = new Date(sub.date);
      const newTimetable = await Timetable.create({
        subjectName: sub.subjectName,
        subjectId: sub.subjectId,
        date: examDate,
        time: sub.time,
        examType: sub.examType,
        createdBy: req.faculty._id
      });
      createdTimetables.push(newTimetable);
    }

    res.status(201).json({ success: true, message: 'Timetable created successfully', data: createdTimetables });
  } catch (error) {
    console.error('Error creating timetable:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTimetable = async (req, res) => {
  try {
    const timetables = await Timetable.find().sort({ date: 1 }).populate('createdBy', 'name department');
    res.status(200).json({ success: true, data: timetables });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createTimetable,
  getTimetable
};
