const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(422).json({ message: 'Error de validación', errors });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'El registro ya existe' });
  }

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ message });
};

const notFound = (req, res) => {
  res.status(404).json({ message: `Ruta ${req.originalUrl} no encontrada` });
};

module.exports = { errorHandler, notFound };
