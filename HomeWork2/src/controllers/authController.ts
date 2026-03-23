import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

// Hardcoded user for demo purposes
// In production this would come from a Users table in the database
const DEMO_USER = {
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
};

// POST /auth/login - returns a JWT token
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }

        if (username !== DEMO_USER.username || !bcrypt.compareSync(password, DEMO_USER.password)) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { username },
            process.env.JWT_SECRET as string
        );

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error during login', error });
    }
};