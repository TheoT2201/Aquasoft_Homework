const { DataTypes, Model } = require('sequelize');
const { sequelize } = require("../config/database");

class Amenity extends Model {}

Amenity.init(
    {
        AmenityID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            field: 'amenityid',
        },
        GlobalPropertyID: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'globalpropertyid'
        },
        AmenityName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'amenityname'
        },

    },
    {
        sequelize,
        tableName: 'amenities',
        timestamps: false,
    }
);

module.exports = Amenity;