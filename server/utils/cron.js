import User from "../models/user.model.js";

export const cleanDb = async () => {
  try {
    await User.deleteMany({
      isVerified: false,
      hasUpdatedProfile: false,
    });

    console.log("DB cleaned successfully at minute: ", new Date().getMinutes());
  } catch (error) {
    console.log("Cleaning DB failed: ", error);
  }
};
