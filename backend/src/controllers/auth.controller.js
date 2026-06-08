const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Business } = require('../models');

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, businessId: user.businessId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      include: [{ model: Business, as: 'business' }],
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = generateToken(user);
    const { password: _, ...userData } = user.toJSON();
    res.json({ token, user: userData });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, businessId } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role, businessId });
    const { password: _, ...userData } = user.toJSON();
    res.status(201).json({ user: userData });
  } catch (err) {
    next(err);
  }
};

exports.profile = async (req, res) => {
  const { password: _, ...userData } = req.user.toJSON();
  res.json({ user: userData });
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const valid = await bcrypt.compare(currentPassword, req.user.password);
    if (!valid) return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
};
