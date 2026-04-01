const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Request extends Model {}

Request.init(
    {
        RequestID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, 
            field: 'requestid',
        },
        UserID: {
            type: DataTypes.UUID, 
            allowNull: false,
            field: 'userid',
        },
        RequestedRole: {
            type: DataTypes.ENUM('HotelManager', 'GroupManager'),
            allowNull: false,
            field: 'requestedrole',
        },
        Status: {
            type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
            allowNull: false,
            defaultValue: 'Pending', 
            field: 'status',
        },
        Description: {
            type: DataTypes.TEXT,
            allowNull: false, 
            field: 'description',
        },
        DocumentURL: {
            type: DataTypes.STRING(255),
            allowNull: true, 
            field: 'documenturl',
        },
    },
    {
        sequelize,
        tableName: 'requests',
        timestamps: true, 
    }
);

module.exports = Request;