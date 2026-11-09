
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');

const canManageSubject = (subject, user) => {
  return user.role === 'admin' ||
    subject.createdBy.toString() === user._id.toString();
};

// CREATE SUBJECT
exports.createSubject = async (req, res) => {
  try {
    const { className, name, description } = req.body;

if (!className || !name) {
  return res.status(400).json({
    success: false,
    message: 'Class name and subject name are required.'
  });
}

const existingSubject = await Subject.findOne({
  className: className.trim(),
  name: name.trim()
});

if (existingSubject) {
  return res.status(400).json({
    success: false,
    message: 'This subject already exists in this class.'
  });
}

const subject = await Subject.create({
  className: className.trim(),
  name: name.trim(),
  description: description || '',
  createdBy: req.user._id
});
    

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      subject
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This subject already exists in this class/course.'
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET SUBJECTS
exports.getSubjects = async (req, res) => {
  try {
    const filter = req.user.role === 'teacher'
      ? { createdBy: req.user._id }
      : {};

    const subjects = await Subject.find(filter)
      .populate('createdBy', 'fullName email')
      .sort({ className: 1, name: 1 });

    return res.status(200).json({
      success: true,
      count: subjects.length,
      subjects
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE / RENAME SUBJECT
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { className, name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID.'
      });
    }

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found.'
      });
    }

    if (!canManageSubject(subject, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update this subject.'
      });
    }

    if (!className?.trim() || !name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Class/Course Name and Subject Name are required.'
      });
    }

    const duplicate = await Subject.findOne({
      _id: { $ne: id },
      className: className.trim(),
      name: name.trim()
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'This subject already exists in this class/course.'
      });
    }

    subject.className = className.trim();
    subject.name = name.trim();
    subject.description = description?.trim() || '';

    await subject.save();

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully.',
      subject
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This subject already exists in this class/course.'
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE SUBJECT
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID.'
      });
    }

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found.'
      });
    }

    if (!canManageSubject(subject, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this subject.'
      });
    }

    const linkedExam = await Exam.findOne({ subject: subject._id });

    if (linkedExam) {
      return res.status(409).json({
        success: false,
        message: 'This subject is linked with an exam and cannot be deleted. Existing exam records must be preserved.'
      });
    }

    await Subject.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
