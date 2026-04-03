import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
      minLength: [8, "Full name must be minimum 6 characters long"],
      maxLength: [50, "Full Name must be maximum 50 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phoneNumber: {
      type: String,
      match: [
        /^\+9779\d{9}$/,
        "Mobile number must start with +977 and contain exactly 10 digits",
      ],
      minlength: [14, "Mobile number must be exactly 14 characters"],
      maxlength: [14, "Mobile number must be exactly 14 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "user"],
        message: "Role must be admin or user",
      },
      default: "user",
      required: [true, "User role is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    hasUpdatedProfile: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
