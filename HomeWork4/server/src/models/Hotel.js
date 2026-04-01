const { DataTypes, Model } = require('sequelize');
const { sequelize } = require("../config/database");

class Hotel extends Model {}

Hotel.init(
    {
        GlobalPropertyID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            field: 'globalpropertyid'
        },
        SourcePropertyID: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'sourcepropertyid'
        },
        GlobalPropertyName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'globalpropertyname'
        },
        GlobalChainCode: {
            type: DataTypes.STRING(10),
            allowNull: false,
            field: 'globalchaincode'
        },
        PropertyAddress1: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'propertyaddress1'
        },
        PropertyAddress2: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'propertyaddress2'
        },
        PrimaryAirportCode: {
            type: DataTypes.STRING(10),
            allowNull: false,
            field: 'primaryairportcode'
        },
        CityID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'cityid'
        },
        PropertyStateProvinceID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'propertystateprovinceid'
        },
        PropertyZipPostal: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'propertyzippostal'
        },
        PropertyPhoneNumber: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: 'propertyphonenumber'
        },
        PropertyFaxNumber: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'propertyfaxnumber'
        },
        SabrePropertyRating: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: true,
            field: 'sabrepropertyrating'
        },
        PropertyLatitude: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: false,
            field: 'propertylatitude'
        },
        PropertyLongitude: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: false,
            field: 'propertylongitude'
        },
        SourceGroupCode: {
            type: DataTypes.STRING(10),
            allowNull: false,
            field: 'sourcegroupcode'
        },
        HotelGroupID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'hotelgroupid'
        },
        NumberOfRooms: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'numberofrooms'
        },
        DistanceToTheAirport: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: true,
            field: 'distancetotheairport'
        },
    },
    {
        sequelize,
        tableName: 'hotels',
        timestamps: false,
    }
);

module.exports = Hotel;