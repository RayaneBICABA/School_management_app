// Middleware to allow users to access their own profile
// and authorized roles to access any profile

exports.selfAccess = (req, res, next) => {
  // Allow access if user is accessing their own profile
  if (req.user._id.toString() === req.params.id) {
    return next();
  }
  
  // Otherwise, check if user has authorized roles for accessing other profiles
  const authorizedRoles = ['ADMIN', 'CPE', 'PROVISEUR', 'CENSEUR', 'PROFESSEUR', 'SECRETAIRE', 'PARENT'];
  if (authorizedRoles.includes(req.user.role)) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: `Le rôle utilisateur ${req.user.role} n'est pas autorisé à accéder à cette ressource`
  });
};
