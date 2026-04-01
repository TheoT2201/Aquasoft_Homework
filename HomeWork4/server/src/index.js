require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/database');
const { Permission } = require('./models/index');

// Register models before sync
require('./models/User');
require('./models/Permission');
require('./models/Hotel');
require('./models/PriceOffer');
require('./models/Review');
require('./models/City');
require('./models/Region');
require('./models/Airport');
require('./models/HotelGroup');
require('./models/Amenity');
require('./models/Request');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ alter: true });
    console.log('Models synced.');

    await Permission.seedDefaults();

    app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
})();