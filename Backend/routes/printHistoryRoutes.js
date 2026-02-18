const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const PrintHistory = require('../models/PrintHistory');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @route   GET /api/v1/print-history
// @desc    Get print history with filters
// @access  Private (Secretaire, Proviseur, Admin)
router.get('/', protect, authorize('secretaire', 'proviseur', 'admin'), asyncHandler(async (req, res, next) => {
    const {
        startDate,
        endDate,
        classe,
        action,
        actionType,
        user,
        search,
        page = 1,
        limit = 50
    } = req.query;

    // Build query
    const query = {};

    // Date range filter
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Other filters
    if (classe) query.classe = classe;
    if (action) query.action = action;
    if (actionType) query.actionType = actionType;
    if (user) query.user = user;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    let historyQuery = PrintHistory.find(query)
        .populate('bulletin', 'periode anneeScolaire moyenneGenerale')
        .populate('eleve', 'nom prenom matricule')
        .populate('classe', 'niveau section')
        .populate('user', 'nom prenom role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const history = await historyQuery;

    // Search filter (applied after population)
    let filteredHistory = history;
    if (search) {
        const searchLower = search.toLowerCase();
        filteredHistory = history.filter(item => {
            if (item.eleve) {
                const fullName = `${item.eleve.nom} ${item.eleve.prenom}`.toLowerCase();
                const matricule = item.eleve.matricule?.toLowerCase() || '';
                return fullName.includes(searchLower) || matricule.includes(searchLower);
            }
            if (item.classe) {
                const className = `${item.classe.niveau} ${item.classe.section}`.toLowerCase();
                return className.includes(searchLower);
            }
            return false;
        });
    }

    // Get total count for pagination
    const total = await PrintHistory.countDocuments(query);

    res.status(200).json({
        success: true,
        count: filteredHistory.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: filteredHistory
    });
}));

// @route   POST /api/v1/print-history
// @desc    Record a print/download action
// @access  Private (Secretaire, Proviseur, Admin)
router.post('/', protect, authorize('secretaire', 'proviseur', 'admin'), asyncHandler(async (req, res, next) => {
    const { bulletin, eleve, classe, action, actionType, metadata } = req.body;

    // Validate required fields
    if (!classe || !action || !actionType) {
        return next(new ErrorResponse('Classe, action et actionType sont requis', 400));
    }

    // Create print history entry
    const printHistory = await PrintHistory.create({
        bulletin: bulletin || null,
        eleve: eleve || null,
        classe,
        action,
        actionType,
        user: req.user._id,
        metadata: metadata || {}
    });

    // Populate before sending response
    await printHistory.populate('bulletin eleve classe user');

    res.status(201).json({
        success: true,
        data: printHistory
    });
}));

// @route   GET /api/v1/print-history/stats
// @desc    Get print history statistics
// @access  Private (Secretaire, Proviseur, Admin)
router.get('/stats', protect, authorize('secretaire', 'proviseur', 'admin'), asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
        matchStage.timestamp = {};
        if (startDate) matchStage.timestamp.$gte = new Date(startDate);
        if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }

    const stats = await PrintHistory.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalPrints: { $sum: 1 },
                totalDownloads: {
                    $sum: { $cond: [{ $eq: ['$action', 'DOWNLOAD'] }, 1, 0] }
                },
                totalPrintActions: {
                    $sum: { $cond: [{ $eq: ['$action', 'PRINT'] }, 1, 0] }
                },
                individualActions: {
                    $sum: { $cond: [{ $eq: ['$actionType', 'INDIVIDUAL'] }, 1, 0] }
                },
                classActions: {
                    $sum: { $cond: [{ $eq: ['$actionType', 'CLASS'] }, 1, 0] }
                },
                totalStudents: { $sum: '$metadata.studentCount' }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: stats[0] || {
            totalPrints: 0,
            totalDownloads: 0,
            totalPrintActions: 0,
            individualActions: 0,
            classActions: 0,
            totalStudents: 0
        }
    });
}));

module.exports = router;
