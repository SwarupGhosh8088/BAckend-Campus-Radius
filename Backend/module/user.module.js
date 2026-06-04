import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true

    },

   email: {
  type: String,
  unique: true,
  sparse: true
},

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: null,
      sparse: true

    },

    dp: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    college: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isLoggedIn: {
      type: Boolean,
      default: false,
    },

    token: {
      type: String,
      default: null,
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);