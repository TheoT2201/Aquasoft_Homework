const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Rating extends Model {}

Rating.init(
    {
        GlobalPropertyID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            field: 'globalpropertyid',
        },
        CompositeScore: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            field: 'composite_score',
        },
        OverallScore: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            field: 'overall_score',
        },
        CleanlinessScore: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            field: 'cleanliness_score',
        },
        ServiceScore: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            field: 'service_score',
        },
        SleepQualityScore: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            field: 'sleepquality_score',
        },
        LocationScore: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            field: 'location_score',
        },
        RoomsScore: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            field: 'rooms_score',
        },
        SabreScore: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            field: 'sabre_score',
        },
        AmenityScore: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            field: 'amenity_score',
        },
        AmenityCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'amenity_count',
        },
        DistanceScore: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            field: 'distance_score',
        },
        DistanceMiles: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: true,
            field: 'distance_miles',
        },
        RoomCountScore: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            field: 'roomcount_score',
        },
        RoomCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'room_count',
        },
        ReviewCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'review_count',
        },
        ReviewsReliable: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'reviews_reliable',
        },
        Rank: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'rank',
        },
        ComputedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'computed_at',
        },
    },
    {
        sequelize,
        tableName: 'ratings',
        timestamps: false,
    }
);

module.exports = Rating;