require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // En desarrollo usa alter para reflejar cambios de modelos;
    // en producción solo crea las tablas que falten (no destructivo).
    if (process.env.NODE_ENV === 'production') {
      await sequelize.sync();
    } else {
      await sequelize.sync({ alter: true });
    }
    console.log('Modelos sincronizados.');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

start();
