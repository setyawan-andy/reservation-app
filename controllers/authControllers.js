import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

// register
export const register = async (req, res, next) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        next(error);
    }
};

// login
export const login = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return next(createError(404, "Username not found"));

        const isPasswordValid = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!isPasswordValid)
            return next(createError(400, "username or password is invalid"));

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET
        );
        const { password, isAdmin, ...userData } = user._doc;
        res.cookie("access_token", token, {
            httpOnly: true,
        })
            .status(200)
            .json({ ...userData });
    } catch (error) {
        next(error);
    }
};
