import { appError } from "../utils/appError.js";
import { redis } from "../utils/redis.js";
import { signup, OTP_TTL, MAX_OTP_ATTEMPTS } from "./auth.controller.js";
import { sendEmail } from "../utils/email.js";
import sanitize from "mongo-sanitize";
import { otpTemplate } from "../templates/otpTemplate.js";
import User from "../models/user.model.js";
import crypto from "crypto";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const userExisted = await User.findById(userId).select("-password");

    if (!userExisted) {
      return appError(res, 404, "Account does not exist");
    }

    return res.status(200).json({
      success: true,
      message: `${userExisted.fullName} profile fetched`,
      data: userExisted,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber } = req.body;

    const userId = req.user._id;

    const userExisted = await User.findById(userId).select("-password");

    if (!userExisted) {
      return appError(res, 404, "Account does not exist");
    }

    if (email && email !== userExisted.email) {
      userExisted.isVerified = false;
      userExisted.hasUpdatedProfile = true;

      userExisted.email = email;
      const attemptsKey = `email:verify:attempts:${email}`;
      const otpKey = `email:verify:otp:${email}`;
      const currentAttempts = Number(await redis.get(attemptsKey)) || 0;

      if (currentAttempts >= MAX_OTP_ATTEMPTS) {
        return appError(res, 429, "Too many OTP request. Try again later");
      }
      await redis.set(attemptsKey, +currentAttempts + 1, { ex: OTP_TTL });

      const otp = crypto.randomInt(100000, 999999).toString();

      await redis.set(otpKey, otp, { ex: OTP_TTL });

      if (fullName) {
        userExisted.fullName = fullName;
      }

      if (phoneNumber) {
        userExisted.phoneNumber = phoneNumber;
      }

      await userExisted.save();

      const link = `http://localhost:5173/verify/signup?email=${email}`;

      await sendEmail({
        to: email,
        subject: "Verify Your Email",
        html: otpTemplate("signup", otp, signup.message, link, email),
      });

      return res.clearCookie("token").status(200).json({
        success: true,
        message: "If your email is valid! you can verify you email again.",
      });
    }

    if (fullName) {
      userExisted.fullName = fullName;
    }

    if (phoneNumber) {
      userExisted.phoneNumber = phoneNumber;
    }

    await userExisted.save();

    return res.status(200).json({
      success: true,
      message: "profile updated successfully",
      data: userExisted,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const resendVerifyOtp = async (req, res) => {
  try {
    const { email } = sanitize(req.body);

    if (!email) {
      return appError(res, 400, "Email is required");
    }

    const userExisted = await User.findOne({ email });

    if (!userExisted) {
      return appError(res, 404, "Account does not exist");
    }

    if (userExisted.isVerified) {
      return appError(res, 404, "Account already verified. You can login");
    }

    const attemptsKey = `email:verify:attempts:${email}`;
    const otpKey = `email:verify:otp:${email}`;

    const currentAttempts = Number(await redis.get(attemptsKey)) || 0;

    if (currentAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many OTP requests. Try again later.",
      });
    }
    await redis.set(attemptsKey, +currentAttempts + 1, { ex: OTP_TTL });

    const otp = crypto.randomInt(100000, 999999).toString();

    await redis.set(otpKey, otp, { ex: OTP_TTL });

    const link = `http://localhost:5173/verify/signup?email=${email}`;

    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: otpTemplate("signup", otp, signup.message, link, email),
    });

    return res.status(200).json({
      success: true,
      message: "If your email is valid! you can verify your email again.",
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};
