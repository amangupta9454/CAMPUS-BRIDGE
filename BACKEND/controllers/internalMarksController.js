const InternalMarks = require('../models/InternalMarks');
const xlsx = require('xlsx');

const uploadInternalMarks = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No Excel file provided' });
    }

    // Parse Excel from buffer
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data.length) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' });
    }

    const marksToInsert = [];
    const errors = [];

    data.forEach((row, index) => {
      // Validate Required fields
      if (
        row.studentId === undefined || row.subjectName === undefined || row.subjectId === undefined ||
        row.totalInternalMarks === undefined || row.obtainedInternalMarks === undefined ||
        row.totalExternalMarks === undefined || row.obtainedExternalMarks === undefined ||
        row.totalLabMarks === undefined || row.obtainedLabMarks === undefined
      ) {
        errors.push(`Row ${index + 2}: Missing required fields.`);
        return;
      }

      // Validate Marks <= total
      if (
        row.obtainedInternalMarks > row.totalInternalMarks ||
        row.obtainedExternalMarks > row.totalExternalMarks ||
        row.obtainedLabMarks > row.totalLabMarks
      ) {
        errors.push(`Row ${index + 2}: Obtained marks cannot be greater than total marks.`);
        return;
      }

      marksToInsert.push({
        studentId: String(row.studentId),
        subjectName: row.subjectName,
        subjectId: row.subjectId,
        totalInternalMarks: Number(row.totalInternalMarks),
        obtainedInternalMarks: Number(row.obtainedInternalMarks),
        totalExternalMarks: Number(row.totalExternalMarks),
        obtainedExternalMarks: Number(row.obtainedExternalMarks),
        totalLabMarks: Number(row.totalLabMarks),
        obtainedLabMarks: Number(row.obtainedLabMarks),
        uploadedBy: req.faculty._id
      });
    });

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    await InternalMarks.insertMany(marksToInsert);

    res.status(201).json({ success: true, message: `Successfully inserted ${marksToInsert.length} records.` });
  } catch (error) {
    console.error('Error uploading internal marks:', error.message);
    res.status(500).json({ success: false, message: 'Server error during Excel upload' });
  }
};

const getStudentInternalMarks = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const marks = await InternalMarks.find({ studentId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: marks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  uploadInternalMarks,
  getStudentInternalMarks
};
