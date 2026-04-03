export const appError = (res, statusCode, errorMessage) => {
  return res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
};
