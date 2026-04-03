import bcryptjs from "bcryptjs";

export const hashPassword = async (plainPassword) => {
  try {
    const hashedPassword = await bcryptjs.hash(plainPassword, 10);
    return hashedPassword;
  } catch (error) {
    console.log(error.message);
    throw new Error("Error hashing password");
  }
};
