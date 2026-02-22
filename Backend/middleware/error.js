const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.log(err);

    // Mongoose bad ObjectId (CastError)
    if (err.name === 'CastError') {
        const message = `Ressource introuvable`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key (Code 11000)
    if (err.code === 11000) {
        // Extract the field value or key pattern
        const fieldName = err.keyValue ? Object.keys(err.keyValue)[0] : 'Inconnu';
        const message = `La valeur pour '${fieldName}' existe déjà. Veuillez en choisir une autre.`;
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(`Erreur de validation: ${message.join(', ')}`, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Erreur serveur'
    });
};

module.exports = errorHandler;
