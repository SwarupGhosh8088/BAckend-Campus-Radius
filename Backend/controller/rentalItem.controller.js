import { RentalItem } from "../module/rentalItem.model.js";
import { User } from "../module/user.module.js";
import mongoose from "mongoose";






export const postItem = async (req, res) => {
    try {

        const {
            name,
            description,
            category,
            pricePerMonth,
            sellingPrice,
            pickupLocation
        } = req.body;

        const owner = req.user.id;



        if (
            !name ||
            !description ||
            !category ||
            pricePerMonth == null ||
            !pickupLocation
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }



        //  Check user
        const existingUser = await User.findById(owner);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        // Check login status
        if (!existingUser.isLoggedIn) {
            return res.status(401).json({
                success: false,
                message: "Please login/register to post items"
            });
        }

        //find same name post
        const existingPost = await RentalItem.findOne({ name });

        if (existingPost) {
            return res.status(409).json({
                success: false,
                message: "Already Posted"
            });
        }

        //  Images
        const images = req.files
            ? req.files.map(file => file.path)
            : [];

        // Create post
        const newPost = await RentalItem.create({
            name,
            description,
            category,
            pricePerMonth,
            sellingPrice,
            pickupLocation,
            owner,
            images
        });

        return res.status(201).json({
            success: true,
            message: "New Post Uploaded Successfully",
            data: newPost
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateItem = async (req, res) => {
    const { itemId } = req.params;

    try {
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "Item ID is required",
            });
        }

        const {
            name,
            description,
            category,
            pricePerMonth,
            sellingPrice,
            pickupLocation,
            owner,
            images,
        } = req.body;

        const updateData = {
            name,
            description,
            category,
            pricePerMonth,
            sellingPrice,
            pickupLocation,
            owner,
            images,
        };

        // If a new image is uploaded
        if (req.file) {
            updateData.images = [req.file.path];
        }

        const item = await RentalItem.findByIdAndUpdate(
            itemId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Item updated successfully",
            data: item,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const getAllItems = async (req, res) => {
    try {



        const allItems = await RentalItem.find()

        return res.status(200).json({
            success: true,
            count: allItems.length,
            allItems

        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}




export const getItemDetails = async (req, res) => {
    const { itemId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid item ID"
            });
        }

        const itemDetails = await RentalItem.findById(itemId).populate("owner");

        if (!itemDetails) {
            return res.status(404).json({
                success: false,
                message: "Item not listed",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Item fetched successfully",
            data: itemDetails,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const deleteItem = async (req, res) => {

    const { itemId } = req.params


    try {

        if (!itemId) {
            return res.status(404).json({
                success: false,
                message: "Item id not found",
            });

        }


        const item = await RentalItem.findByIdAndDelete(itemId)

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Item deleted successfully",

        });



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }


}


export const getUserItems = async (req, res) => {
    const owner = req.user.id;

    try {
        const existingUser = await User.findById(owner);

        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        if (!existingUser.isLoggedIn) {
            return res.status(400).json({
                success: false,
                message: "Please login/register to post items"
            });
        }

        const items = await RentalItem.find({ owner });

        if (items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No posts made yet",
                items: []
            });
        }

        return res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



export const findByCategory = async (req, res) => {

    const owner = req.user.id
    const { category } = req.params;


    try {
        const existingUser = await User.findById(owner);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // check login
        if (!existingUser.isLoggedIn) {
            return res.status(401).json({
                success: false,
                message: "Please login/register to post items"
            });
        }

        const item = await RentalItem.find({ category })

        if (item.length == 0) {
            return res.status(200).json({
                success: true,
                message: "No Post Made  yet"
            });

        }
        return res.status(200).json({
            success: true,
            count: item.length,
            item

        });


    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

export const getItemByName = async (req, res) => {
    const { name } = req.params

    try {
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "name not found"
            });

        }

        const items = await RentalItem.find({
            name: { $regex: name, $options: "i" }
        });

        if (items.length == 0) {
            return res.status(200).json({
                success: true,
                count: items.length,
                data: items
            });
        }

        return res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });



    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
}





export const getItemByCategory = async (req, res) => {
    const { category } = req.params

    try {
        if (!category) {
            return res.status(400).json({
                success: false,
                message: "category not found"
            });

        }

        const items = await RentalItem.find({
            category: { $regex: category, $options: "i" }
        });

        if (items.length == 0) {
            return res.status(200).json({
                success: true,
                count: items.length,
                data: items
            });
        }

        return res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });



    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
}

export const getItemByCollege = async (req, res) => {
    const { college } = req.params;

    try {
        if (!college) {
            return res.status(400).json({
                success: false,
                message: "College not provided"
            });
        }

        const users = await User.find({
            college: { $regex: college, $options: "i" }
        });

        const userIds = users.map(user => user._id);

        const items = await RentalItem.find({
            owner: { $in: userIds }
        });

        return res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};