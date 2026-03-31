import City from "./City";
import Region from "./Region";
import Hotel from "./Hotel";
import PriceOffer from './PriceOffer';
import Airport from './Airport';
import HotelGroup from "./HotelGroup";
import Review from "./Review";
import User from "./User";
import Amenities from "./Amenities";

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

Airport.hasMany(HotelGroup, { foreignKey: 'airportid' });   
HotelGroup.belongsTo(Airport, { foreignKey: 'airportid' });

Hotel.hasMany(Review, { foreignKey: 'globalpropertyid' });
Review.belongsTo(Hotel, { foreignKey: 'globalpropertyid' });

Hotel.hasMany(Amenities, {foreignKey: 'globalpropertyid'});
Amenities.hasMany(Hotel, {foreignKey: 'globalpropertyid'});

User.hasMany(Review, { foreignKey: 'id' });
Review.belongsTo(User, { foreignKey: 'id' });


export{City, Region, Hotel, PriceOffer, Airport, HotelGroup, Review, User, Amenities}; 