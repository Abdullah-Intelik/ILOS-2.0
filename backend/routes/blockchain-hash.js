// Blockchain functionality removed - dummy file for compatibility
module.exports = {
  createFormHashAfterSubmission: async () => {
    return { success: true, message: 'Blockchain disabled' };
  },
  router: require('express').Router()
};

