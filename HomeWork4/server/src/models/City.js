const { DataTypes, Model } = require('sequelize');
const { sequelize } = require("../config/database");

class City extends Model {}

City.init(
    {
        CityID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            field: 'cityid'
        },
        CityName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'cityname'
        },
        Country: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'country'
        },
    },
    {
        sequelize,
        tableName: 'cities',
        timestamps: false,
    }
);

module.exports = City;