const City = require("./City");
const Region = require("./Region");
const Hotel = require("./Hotel");
const PriceOffer = require('./PriceOffer');
const Airport = require('./Airport');
const HotelGroup = require("./HotelGroup");
const Review = require("./Review");
const User = require("./User");
const Amenity = require("./Amenity");

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
Amenity.hasMany(Hotel, {foreignKey: 'globalpropertyid'});


module.exports = { City, Region, Hotel, PriceOffer, Airport, HotelGroup, Review, User, Amenity };