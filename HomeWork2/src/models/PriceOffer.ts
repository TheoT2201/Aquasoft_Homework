import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

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
            type: DataTypes.STRING(50),
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
            field: 'currency'
        },
        Description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
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

export default PriceOffer;