const User = require('../models/User');
const Setting = require('../models/Setting');
const mongoose = require('mongoose');
const { generateStudentProfilePDF } = require('../utils/pdfGenerator');

// @desc    Get student profile (allows self-access)
// @route   GET /api/v1/student-profile/profile/:id
// @access  Private (with selfAccess middleware)
exports.getStudentProfile = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'ID d\'élève invalide'
      });
    }

    // Get student with populated class information
    const student = await User.findById(studentId).populate('classe');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Élève non trouvé'
      });
    }

    // Verify the user is a student (additional security check)
    if (student.role !== 'ELEVE') {
      return res.status(403).json({
        success: false,
        error: 'Cette route est réservée aux profils élèves'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });

  } catch (error) {
    console.error('Erreur getStudentProfile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update student profile (allows self-access)
// @route   PUT /api/v1/student-profile/profile/:id
// @access  Private (with selfAccess middleware)
exports.updateStudentProfile = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'ID d\'élève invalide'
      });
    }

    // Get student to verify it exists and is a student
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Élève non trouvé'
      });
    }

    // Verify the user is a student (additional security check)
    if (student.role !== 'ELEVE') {
      return res.status(403).json({
        success: false,
        error: 'Cette route est réservée aux profils élèves'
      });
    }

    // Students can update personal, contact, parental, and medical information
    const allowedFields = [
      'prenom', 'nom', 'email', 'telephone', 'dateNaissance', 'lieuNaissance', 'adresse',
      'fatherName', 'fatherPhone', 'fatherEmail',
      'motherName', 'motherPhone', 'motherEmail',
      'legalGuardian', 'guardianPhone',
      'bloodGroup', 'nativeLanguage', 'allergens', 'medicaments'
    ];
    const updateData = {};

    // Only include allowed fields from request body
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    console.log('Données reçues pour mise à jour:', req.body);
    console.log('Données autorisées pour mise à jour:', updateData);

    // Update the student
    const updatedStudent = await User.findByIdAndUpdate(
      studentId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedStudent
    });

  } catch (error) {
    console.error('Erreur updateStudentProfile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// @desc    Export student profile to PDF
// @route   GET /api/v1/student-profile/profile/:id/export
// @access  Private (with selfAccess middleware)
exports.exportStudentProfile = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'ID d\'élève invalide'
      });
    }

    // Get student with populated class information
    const student = await User.findById(studentId).populate('classe');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Élève non trouvé'
      });
    }

    // Verify the user is a student
    if (student.role !== 'ELEVE') {
      return res.status(400).json({
        success: false,
        error: 'Seuls les profils élèves peuvent être exportés'
      });
    }

    // Fetch school config
    const schoolSetting = await Setting.findOne({ key: 'school_config' });
    const schoolConfig = schoolSetting ? schoolSetting.value : {};

    // Generate PDF
    const pdfBuffer = await generateStudentProfilePDF(student, schoolConfig);

    // Set headers for file download
    const fileName = `fiche-eleve-${student.prenom}-${student.nom}.pdf`.replace(/\s+/g, '-').toLowerCase();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erreur exportStudentProfile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
