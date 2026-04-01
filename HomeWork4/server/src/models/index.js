const City = require("./City");
const Region = require("./Region");
const Hotel = require("./Hotel");
const PriceOffer = require('./PriceOffer');
const Airport = require('./Airport');
const HotelGroup = require("./HotelGroup");
const Review = require("./Review");
const User = require("./User");
const Amenity = require("./Amenity");
const Permission = require("./Permission");
const Request = require("./Request");

City.hasMany(Hotel, { foreignKey: 'cityid' });
Hotel.belongsTo(City, { foreignKey: 'cityid' });

City.hasMany(Airport, { foreignKey: 'cityid' });
Airport.belongsTo(City, { foreignKey: 'cityid' });

Region.hasMany(Hotel, { foreignKey: 'propertystateprovinceid' });
Hotel.belongsTo(Region, { foreignKey: 'propertystateprovinceid' });

HotelGroup.hasMany(Hotel, { foreignKey: 'hotelgroupid' });
Hotel.belongsTo(HotelGroup, { foreignKey: 'hotelgroupid' });

Hotel.hasMany(PriceOffer, { foreignKey: 'globalpropertyid' });
PriceOffer.belongsTo(Hotel, { foreignKey: 'globalpropertyid' });

Hotel.hasMany(Review, { foreignKey: 'globalpropertyid' });
Review.belongsTo(Hotel, { foreignKey: 'globalpropertyid' });

Hotel.hasMany(Amenity, {foreignKey: 'globalpropertyid'});
Amenity.belongsTo(Hotel, {foreignKey: 'globalpropertyid'});

User.hasMany(Request, { foreignKey: 'userid' });
Request.belongsTo(User, { foreignKey: 'userid' });

User.hasMany(Hotel, { foreignKey: 'managerid' });
Hotel.belongsTo(User, { as: 'HotelManager', foreignKey: 'managerid' });

User.hasMany(HotelGroup, { foreignKey: 'managerid' });
HotelGroup.belongsTo(User, { as: 'GroupManager', foreignKey: 'managerid' });

module.exports = { City, Region, Hotel, PriceOffer, Airport, HotelGroup, Review, User, Amenity, Permission, Request };