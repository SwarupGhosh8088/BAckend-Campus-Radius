import { User } from "../module/user.module.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { configDotenv } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

export const registerUser = async (req, res) => {

    const {  username, password } = req.body;
    // await mongoose.connection.collection("users").dropIndex("email_1");
    try {

        if (!username  || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const existingUser = await User.findOne({ username });

        // const otp = Math.floor(1000 + Math.random() * 9000).toString();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Username is already used.Try a diffrent one"
            });
        }

        // if (existingUser && !existingUser.isVerified) {

        //     existingUser.otp = otp;
        //     existingUser.otpExpiry = Date.now() + 5 * 60 * 1000;

        //     await existingUser.save();

        //     await verifyMail(otp, email);

        //     return res.status(200).json({
        //         success: true,
        //         message: "OTP resent successfully"
        //     });
        // }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            password: hashPassword,
        });

        const token = jwt.sign(
            { id: newUser._id },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );

        // newUser.otp = otp;
        // newUser.otpExpiry = Date.now() + 5 * 60 * 1000;
        newUser.token = token;

        await newUser.save();

        // await verifyMail(otp, email);

        return res.status(201).json({
            success: true,
            message: " User Registerd successfully",
            data: newUser
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




export const loginUser = async (req, res) => {

    const { username, password } = req.body

    try {

        if (!username || !password) {
            return res.status(400).json(
                {
                    success: false,
                    message: "All the fields are required"
                })

        }


        const user = await User.findOne({ username })

        if (!user  ) {
            return res.status(400).json(
             
                {
                    success: false,
                    message: "You are not Registered "
                })
        }


        // if (!user.isVerified ) {

        //     return res.status(400).json(
        //         {
        //             success: false,
        //             message: "You are not Verified"
        //         })
        // }


        const isMatch = await bcrypt.compare(
            password,
            user.password
        )

        if (!isMatch) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Wrong password Entered"
                })
        }



        const token = await jwt.sign({
            id: user._id,
            username: user.username,
        },
            process.env.SECRET_KEY,
            {
                expiresIn: "7d",
            }
        )

        user.token = token
        user.isLoggedIn = true
        user.otp = null
        user.otpExpiry = null

        await user.save()



        return res.status(201).json(
            {
                success: true,
                message: "User Login Successfull",
                data: user
            })

    }
    catch (e) {

        return res.status(500).json({
            success: false,
            message: e.message

        })



    }

}

export const updateUser = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user",
            });
        }


        const { email, college, phone, role } = req.body;

        if (!email || !college || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please Enter All Details",
            });
        }


        const existingUser= await User.findOne({email})

        if(existingUser)
        {
             return res.status(400).json({
                success: false,
                message: "Email Id is already register to a diffrent Id",
            });

        }

        // block admin spoofing
        if (role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Not allowed",
            });
        }

        // phone validation (basic India-friendly check)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number",
            });
        }

        const updateData = {
            email,
            phone,
            college,
        };

        if (req.file) {
            updateData.dp = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select("-password -otp");

        return res.status(200).json({
            success: true,
            message: "Updated Successfully",
            data: user,
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: e.message,
        });
    }
};

export const getUser = async (req, res) => {
    const userId = req.user?.id;

    try {
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found, please log in again",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            data: user,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}