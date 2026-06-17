export const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

export const tooManyRequests = (message) => {
  const error = new Error(message);
  error.statusCode = 429;
  return error;
};
