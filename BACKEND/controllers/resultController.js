const ExamResult = require('../models/ExamResult');
const xlsx = require('xlsx');

const uploadExamResult = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No Excel file provided' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data.length) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' });
    }

    const resultsToInsert = [];
    const errors = [];

    data.forEach((row, index) => {
      // Validate Required fields
      if (
        row.studentId === undefined || row.subjectName === undefined || row.subjectId === undefined ||
        row.totalMarks === undefined || row.obtainedMarks === undefined || row.facultyName === undefined
      ) {
        errors.push(`Row ${index + 2}: Missing required fields.`);
        return;
      }

      // Validate Marks <= total
      if (Number(row.obtainedMarks) > Number(row.totalMarks)) {
        errors.push(`Row ${index + 2}: Obtained marks cannot exceed total marks.`);
        return;
      }

      resultsToInsert.push({
        studentId: String(row.studentId),
        subjectName: row.subjectName,
        subjectId: row.subjectId,
        totalMarks: Number(row.totalMarks),
        obtainedMarks: Number(row.obtainedMarks),
        facultyName: row.facultyName,
        uploadedBy: req.faculty._id
      });
    });

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    await ExamResult.insertMany(resultsToInsert);

    res.status(201).json({ success: true, message: `Successfully inserted ${resultsToInsert.length} results.` });
  } catch (error) {
    console.error('Error uploading exam results:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getStudentExamResult = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const results = await ExamResult.find({ studentId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  uploadExamResult,
  getStudentExamResult
};
