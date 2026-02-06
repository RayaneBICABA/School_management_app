const User = require('../models/User');

// @desc    Add a child to parent account
// @route   POST /api/v1/parents/children
// @access  Private (Parent only)
exports.addChild = async (req, res, next) => {
    try {
        const { matricule } = req.body;

        if (!matricule) {
            return res.status(400).json({ success: false, error: 'Veuillez fournir le matricule de l\'élève' });
        }

        // Find student by matricule
        const student = await User.findOne({ matricule, role: 'ELEVE' });

        if (!student) {
            return res.status(404).json({ success: false, error: 'Aucun élève trouvé avec ce matricule' });
        }

        // Add to parent's children list if not already there
        const parent = await User.findById(req.user.id);

        if (parent.children.includes(student._id)) {
            return res.status(400).json({ success: false, error: 'Cet élève est déjà ajouté à votre liste' });
        }

        parent.children.push(student._id);
        await parent.save();

        res.status(200).json({
            success: true,
            data: student,
            message: 'Enfant ajouté avec succès'
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all children of logged in parent
// @route   GET /api/v1/parents/children
// @access  Private (Parent only)
exports.getChildren = async (req, res, next) => {
    try {
        const parent = await User.findById(req.user.id).populate({
            path: 'children',
            select: 'nom prenom matricule classe photo email role',
            populate: {
                path: 'classe',
                select: 'niveau section filiere'
            }
        });

        res.status(200).json({
            success: true,
            count: parent.children.length,
            data: parent.children
        });
    } catch (err) {
        next(err);
    }
};
