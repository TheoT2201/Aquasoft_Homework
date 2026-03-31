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
    { role: 'Administrator', resource: 'offers',  canRead: true,  canWrite: true  },
    { role: 'Administrator', resource: 'ratings', canRead: true,  canWrite: true  },

    { role: 'GroupManager',  resource: 'hotels',  canRead: true,  canWrite: true  },
    { role: 'GroupManager',  resource: 'offers',  canRead: true,  canWrite: true  },
    { role: 'GroupManager',  resource: 'ratings', canRead: true,  canWrite: false },
    { role: 'GroupManager',  resource: 'users',   canRead: true,  canWrite: false },

    { role: 'HotelManager',  resource: 'hotels',  canRead: true,  canWrite: true  },
    { role: 'HotelManager',  resource: 'offers',  canRead: true,  canWrite: true  },
    { role: 'HotelManager',  resource: 'ratings', canRead: true,  canWrite: false },
    { role: 'HotelManager',  resource: 'users',   canRead: true,  canWrite: false },

    { role: 'DataOperator',  resource: 'ratings', canRead: true,  canWrite: true  },
    { role: 'DataOperator',  resource: 'hotels',  canRead: true,  canWrite: false },

    { role: 'Traveler',      resource: 'hotels',  canRead: true,  canWrite: false },
    { role: 'Traveler',      resource: 'offers',  canRead: true,  canWrite: false },
    { role: 'Traveler',      resource: 'ratings', canRead: true,  canWrite: false },
  ];

  for (const perm of defaults) {
    await Permission.findOrCreate({
      where: { role: perm.role, resource: perm.resource },
      defaults: perm,
    });
  }
  console.log('Default permissions seeded.');
};

module.exports = { Permission };