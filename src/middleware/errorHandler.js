const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(err.errors).map(error => error.message)
      });
    }
  
    if (err.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID format'
      });
    }
  
    res.status(500).json({
      error: 'Something went wrong!'
    });
  };
  
  module.exports = errorHandler;