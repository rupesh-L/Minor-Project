import bcryptjs from "bcryptjs";

const verifyPassword = async (password, hashedPassword) => {
  const isVerified = await bcryptjs.compare(password, hashedPassword);

  if (isVerified) {
    return true;
  } else {
    return false;
  }
};

export default verifyPassword;
