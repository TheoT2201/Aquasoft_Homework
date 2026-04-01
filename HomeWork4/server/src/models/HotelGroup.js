const { DataTypes, Model } = require('sequelize');
const { sequelize } = require("../config/database");

class HotelGroup extends Model {}

HotelGroup.init(
    {
        HotelGroupID: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          field: 'hotelgroupid'
        },
        GroupName: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: 'groupname'
        },
        GlobalChainCode: {
          type: DataTypes.STRING(10),
          allowNull: false,
          unique: true,
          field: 'globalchaincode'
        },
        ManagerID: {
          type: DataTypes.UUID,
          allowNull: true,
          field: 'managerid'
        },
    }, 
    {
      sequelize,
      tableName: 'hotelgroups',
      timestamps: false, 
    }    
);

module.exports = HotelGroup;