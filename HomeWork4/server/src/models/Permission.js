const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  role: {
    type: DataTypes.ENUM(
      'Administrator', 'HotelManager', 'GroupManager', 'Traveler', 'DataOperator'
    ),
    allowNull: false,
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  canRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canWrite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'permissions',
  timestamps: true,
  indexes: [{ unique: true, fields: ['role', 'resource'] }],
});

Permission.seedDefaults = async () => {
  const defaults = [
    { role: 'Administrator', resource: 'users',   canRead: true,  canWrite: true  },
    { role: 'Administrator', resource: 'hotels',  canRead: true,  canWrite: true  },
    { role: 'Administrator', resource: 'priceoffers',  canRead: true,  canWrite: true  },
    { role: 'Administrator', resource: 'permissions', canRead: true,  canWrite: true  },
    { role: 'Administrator', resource: 'requests', canRead: true,  canWrite: true  },
    { role: 'Administrator', resource: 'regions',  canRead: true,  canWrite: true  },
    { role: 'Administrator', resource: 'hotelgroups', canRead: true,  canWrite: true  },
    { role: 'Administrator', resource: 'amenities', canRead: true,  canWrite: true  },
    { role: 'Administrator', resource: 'airports',  canRead: true,  canWrite: true  },
    { role: 'Administrator', resource: 'cities', canRead: true,  canWrite: true  },
    { role: 'Administrator', resource: 'reviews', canRead: true,  canWrite: true  },
    
    { role: 'GroupManager',  resource: 'hotels',  canRead: true,  canWrite: true  },
    { role: 'GroupManager',  resource: 'priceoffers',  canRead: true,  canWrite: true  },
    { role: 'GroupManager',  resource: 'reviews', canRead: true,  canWrite: false },
    { role: 'GroupManager',  resource: 'users',   canRead: true,  canWrite: false },
    { role: 'GroupManager',  resource: 'amenities', canRead: true,  canWrite: false },
    
    { role: 'HotelManager',  resource: 'hotels',  canRead: true,  canWrite: true  },
    { role: 'HotelManager',  resource: 'priceoffers',  canRead: true,  canWrite: true },
    { role: 'HotelManager',  resource: 'reviews', canRead: true,  canWrite: false },
    { role: 'HotelManager',  resource: 'users',   canRead: true,  canWrite: false },
    { role: 'HotelManager',  resource: 'amenities', canRead: true,  canWrite: false },
    { role: 'HotelManager',  resource: 'requests', canRead: false,  canWrite: true },

    { role: 'DataOperator',  resource: 'reviews', canRead: true,  canWrite: true  },
    { role: 'DataOperator',  resource: 'hotels',  canRead: true,  canWrite: false },
    { role: 'DataOperator',  resource: 'priceoffers',  canRead: true,  canWrite: false },
    { role: 'DataOperator',  resource: 'hotelgroups',   canRead: true,  canWrite: false },

    { role: 'Traveler',      resource: 'regions', canRead: true,  canWrite: false },
    { role: 'Traveler',      resource: 'cities', canRead: true,  canWrite: false },
    { role: 'Traveler',      resource: 'airports',  canRead: true,  canWrite: false },
    { role: 'Traveler',      resource: 'hotels',  canRead: true,  canWrite: false },
    { role: 'Traveler',      resource: 'priceoffers',  canRead: true,  canWrite: false },
    { role: 'Traveler',      resource: 'reviews', canRead: true,  canWrite: true  },
    { role: 'Traveler',      resource: 'amenities', canRead: true,  canWrite: false },
    { role: 'Traveler',      resource: 'requests', canRead: false,  canWrite: true },
  ];

  for (const perm of defaults) {
    await Permission.findOrCreate({
      where: { role: perm.role, resource: perm.resource },
      defaults: perm,
    });
  }
  console.log('Default permissions seeded.');
};

module.exports = Permission;