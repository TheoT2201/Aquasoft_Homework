const { DataTypes, Model } = require('sequelize');
const { sequelize } = require("../config/database");

class Review extends Model {}

Review.init(
    {   
        ReviewID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            field: 'reviewid',
        },
        GlobalPropertyID: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'globalpropertyid'
        },
        ReviewerName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'reviewername'
        },
        ReviewTitle: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'reviewtitle'
        },
        ReviewContent: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'reviewcontent'
            },
        ReviewDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'reviewdate'
            },
        OverallRating: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: true,
            field: 'overallrating'
            },
        Location: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: true,
            field: 'location'
            },
        Rooms: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: true,
            field: 'rooms'
            },
        Value: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: true,
            field: 'value'
            },
        Cleanliness: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: true,
            field: 'cleanliness'
            },
        Service: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: true,
            field: 'service'
            },
        SleepQuality: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: true,
            field: 'sleepquality'
            },
        TripType: {
            type: DataTypes.ENUM('Business', 'Couples', 'Family', 'Friends', 'Solo'),
            allowNull: true,
            field: 'triptype'
            },
        Source: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'source'
            },
    },
    {
        sequelize,
        tableName: 'reviews',
        timestamps: false,
    }
);

module.exports = Review;