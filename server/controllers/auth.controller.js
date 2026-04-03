import User from "../models/user.model.js";
import { appError } from "../utils/appError.js";
import { hashPassword } from "../utils/hashPassword.js";
import { redis } from "../utils/redis.js";
import crypto from "crypto";
import sanitize from "mongo-sanitize";
import { sendEmail } from "../utils/email.js";
import { otpTemplate } from "../templates/otpTemplate.js";
import verifyPassword from "../utils/verifyPassword.js";
import jwt from "jsonwebtoken";

export const OTP_TTL = 600;
export const MAX_OTP_ATTEMPTS = 5;

export const signup = {
  message:
    "This is the official sign up verfication email from Book Store. Please don't share this code. If you did not request it safely ignore it.",
};

const forgotPass = {
  message:
    "This is the official password reset verfication from Book Store. Please dont' share this OTP. If you did not request it safely ignore it",
};

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber } = sanitize(req.body);

    if (!fullName || !email || !password) {
      return appError(res, 400, "Please provide all the fields");
    }

    const userExisted = await User.findOne({ email });

    // 1. CHECK USER EXISTED ON DATABASE AND VERIFIED
    if (userExisted && userExisted.isVerified) {
      return appError(res, 400, "Account already registered and verified");
    }

    // 2. CHECK USER EXISTED AND HAS NOT VERIFIED
    if (userExisted && !userExisted.isVerified) {
      const attemptsKey = `email:verify:attempts:${email}`;
      const currentAttempts = Number(await redis.get(attemptsKey)) || 0;

      if (currentAttempts >= MAX_OTP_ATTEMPTS) {
        return appError(res, 429, "Too many requests. Try again later");
      }

      await redis.set(attemptsKey, +currentAttempts + 1, { ex: OTP_TTL });

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpKey = `email:verify:otp:${email}`;

      await redis.set(otpKey, otp, { ex: OTP_TTL });

      // Send OTP via email

      const link = `http://localhost:5173/verify/signup?email=${email}`;

      await sendEmail({
        to: email,
        subject: "Verify Your Email",
        html: otpTemplate("signup", otp, signup.message, link, email),
      });

      return res.status(200).json({
        success: true,
        message: `OTP resent to ${email}. Please verify your account.`,
      });
    }

    if (password.length < 8) {
      return appError(res, 400, "Password should be minimum 8 characters long");
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber ? phoneNumber : null,
      role: "user",
    });

    await user.save();

    const attemptsKey = `email:verify:attempts:${email}`;
    const currentAttempts = Number(await redis.get(attemptsKey)) || 0;

    if (currentAttempts >= MAX_OTP_ATTEMPTS) {
      return appError(res, 429, "Too many requests. Try again later");
    }

    await redis.set(attemptsKey, +currentAttempts + 1, { ex: OTP_TTL });

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpKey = `email:verify:otp:${email}`;

    await redis.set(otpKey, otp, { ex: OTP_TTL });

    // Send OTP via email

    const link = `http://localhost:5173/verify/signup?email=${email}`;

    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: otpTemplate("signup", otp, signup.message, link),
    });

    return res.status(201).json({
      success: true,
      message: "Account created. Otp has been sent to verify your account.",
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, error.message || "Internal Server Error");
  }
};

export const verifySignUpOtp = async (req, res) => {
  try {
    const { email, otp } = sanitize(req.body);
    if (!email || !otp) {
      return appError(res, 400, "Please provide all the fields");
    }

    const userExisted = await User.findOne({ email });
    const otpKey = `email:verify:otp:${email}`;

    if (!userExisted) {
      return appError(res, 404, "Account does not exist");
    }

    if (userExisted.isVerified) {
      return appError(res, 400, `${email} is already verified`);
    }

    const otpFromRedis = await redis.get(otpKey);

    if (!otpFromRedis) {
      return appError(res, 400, "Otp has been expired");
    }

    if (otpFromRedis !== Number(otp)) {
      return appError(res, 400, "Invalid or Expired otp");
    }

    if (otpFromRedis === Number(otp)) {
      userExisted.isVerified = true;
      userExisted.hasUpdatedProfile = false;
      await userExisted.save();
      await redis.del(otpKey);
      await redis.del(`email:verify:attempts:${email}`);
    }

    return res.status(201).json({
      success: true,
      message: `${email} verified successfully`,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = sanitize(req.body);

    if (!email || !password) {
      return appError(res, 400, "Please fill all the required fields");
    }

    const userExisted = await User.findOne({ email });

    if (!userExisted) {
      return appError(res, 404, "Account does not exist");
    }

    if (!userExisted.isVerified) {
      return appError(res, 400, "Account is not verified");
    }

    const isVerified = await verifyPassword(password, userExisted.password);

    if (!isVerified) {
      return appError(res, 400, "Invalid or incorrect credentials");
    }

    const token = jwt.sign(
      { id: userExisted._id, role: userExisted.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      },
    );

    const { password: pass, ...userData } = userExisted._doc;

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: `Welcome Back, ${userData.fullName}`,
        data: userData,
      });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token").json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = sanitize(req.body);

    if (!email) {
      return appError(res, 400, "Email is required");
    }

    const userExisted = await User.findOne({ email });

    if (!userExisted) {
      return appError(res, 404, "Account does not exist");
    }

    if (!userExisted.isVerified) {
      return appError(res, 404, "Account is not verified");
    }

    const attemptsKey = `account:forgot:attempts:${email}`;
    const otpKey = `account:forgot:otp:${email}`;

    const currentAttempts = Number(await redis.get(attemptsKey)) || 0;

    if (currentAttempts >= MAX_OTP_ATTEMPTS) {
      return appError(res, 429, "Too many OTP requests. Try again later");
    }
    await redis.set(attemptsKey, +currentAttempts + 1, { ex: OTP_TTL });

    const otp = crypto.randomInt(100000, 999999).toString();

    await redis.set(otpKey, otp, { ex: OTP_TTL });

    const link = `http://localhost:5173/verify/forgot/password?email=${email}`;

    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: otpTemplate(
        "forgot-password",
        otp,
        forgotPass.message,
        link,
        email,
      ),
    });

    return res.status(200).json({
      success: true,
      message: "If your email is valid! forgot password otp has been sent",
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const verifyForgotPasswrodOtp = async (req, res) => {
  try {
    const { email, newPassword, confirmNewPassword, otp } = sanitize(req.body);

    if (!email || !newPassword || !confirmNewPassword) {
      return appError(res, 400, "Please fill all the required fields");
    }

    const userExisted = await User.findOne({ email });

    if (!userExisted) {
      return appError(res, 404, "Account does not exist");
    }

    if (!userExisted.isVerified) {
      return appError(res, 404, "Account is not verified");
    }

    if (newPassword !== confirmNewPassword) {
      return appError(
        res,
        400,
        "New password and confirm new password mismatched",
      );
    }

    if (newPassword.length < 8) {
      return appError(res, 400, "Password should be atleast 8 characters long");
    }

    const otpKey = `account:forgot:otp:${email}`;

    const otpFromRedis = await redis.get(otpKey);

    if (!otpFromRedis) {
      return appError(res, 400, "Otp has been expired");
    }

    if (otpFromRedis !== Number(otp)) {
      return appError(res, 400, "Invalid or Expired otp");
    }

    const hashedPassword = await hashPassword(newPassword);

    userExisted.password = hashedPassword;

    await userExisted.save();

    await redis.del(otpKey);
    await redis.del(`account:forgot:attempts:${email}`);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};
