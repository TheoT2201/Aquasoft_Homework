const { DataTypes, Model } = require('sequelize');
const { sequelize } = require("../config/database");

class Airport extends Model {}

Airport.init(
    {
        AirportID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            field: 'airportid'
        },
        iata_code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
            field: 'iata_code'
        },
        airport_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'airport_name'
        },
        CityID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'cityid'
        },
        Latitude: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: false,
            field: 'latitude'
        },
        Longitude: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: false,
            field: 'longitude'
        },
    },
    {
        sequelize,
        tableName: 'airports',
        timestamps: false,
    }
);

module.exports = Airport;