const jwt = require('jsonwebtoken');
const { User, Business } = require('../models');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Business, as: 'business' }],
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Usuario no válido o inactivo' });
    }

    req.user = user;
    req.businessId = user.businessId;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
