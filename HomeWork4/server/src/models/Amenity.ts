import { DataTypes, Model } from 'sequelize';
const sequelize = require("../config/database");

class Amenity extends Model {}

Amenity.init(
    {
        AmenityID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        GlobalPropertyID: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        AmenityName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

    },
    {
        sequelize,
        tableName: 'amenities',
        timestamps: false,
    }
);

export default Amenity;