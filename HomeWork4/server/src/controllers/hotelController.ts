import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Hotel from '../models/Hotel';

// GET /hotels - Retrieve all hotels
export const getAllHotels = async (req: Request, res: Response): Promise<void> => {
    try {
        const hotels = await Hotel.findAll();
        res.status(200).json(hotels);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving hotels', error });
    }
};

// GET /hotels/:name - Retrieve a single hotel by GlobalPropertyName
export const getHotelByName = async (req: Request, res: Response): Promise<void> => {
    try {
        const hotel = await Hotel.findOne({
            where: {
                GlobalPropertyName: {
                    [Op.iLike]: `%${req.params.name}%`   // case-insensitive partial match
                }
            }
        });

        if (!hotel) {
            res.status(404).json({ message: 'Hotel not found' });
            return;
        }

        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving hotel', error });
    }
};

// POST /hotels - Create a new hotel
export const createHotel = async (req: Request, res: Response): Promise<void> => {
    try {
        const hotel = await Hotel.create(req.body);
        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error creating hotel', error });
    }
};

// PUT /hotels/:id - Update a hotel by GlobalPropertyID
export const updateHotel = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string, 10);
        const hotel = await Hotel.findByPk(id);

        if (!hotel) {
            res.status(404).json({ message: 'Hotel not found' });
            return;
        }

        await hotel.update(req.body);
        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error updating hotel', error });
    }
};

// DELETE /hotels/:id - Delete a hotel by GlobalPropertyID
export const deleteHotel = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string, 10);
        const hotel = await Hotel.findByPk(id);

        if (!hotel) {
            res.status(404).json({ message: 'Hotel not found' });
            return;
        }

        await hotel.destroy();
        res.status(200).json({ message: `Hotel ${req.params.id} deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting hotel', error });
    }
};