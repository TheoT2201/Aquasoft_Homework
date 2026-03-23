import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Region extends Model {}

Region.init(
    {
        PropertyStateProvinceID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            field: 'propertystateprovinceid'
        },
        PropertyStateProvinceName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'propertystateprovincename'
        },
    },
    {
        sequelize,
        tableName: 'regions',
        timestamps: false,
    }
);

export default Region;