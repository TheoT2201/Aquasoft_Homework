const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class PriceOffer extends Model {}

PriceOffer.init(
    {
        OfferID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            field: 'offerid'
        },
        GlobalPropertyID: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'globalpropertyid'
        },
        Category: {
            type: DataTypes.ENUM('Budget', 'Standard', 'Superior', 'Deluxe', 'Suite'),
            allowNull: false,
            field: 'category'
        },
        PricePerNight: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'pricepernight'
        },
        Currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'USD',
            field: 'currency'
        },
        IsAvailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: 'isavailable'
        },
    },
    {
        sequelize,
        tableName: 'priceoffers',
        timestamps: false,
    }
);

module.exports = PriceOffer;