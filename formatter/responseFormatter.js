module.exports = {
  success: (data, message = 'Success') => {
    return {
      success: true,
      message: message,
      results: data,
    };
  },
  error: (message = 'Internal Server Error') => {
    return {
      success: false,
      message: message,
    };
  },
};