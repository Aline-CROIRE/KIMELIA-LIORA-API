const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    const errors = err.errors.map((e) => ({ field: e.path[0], message: e.message }));
    return res.status(400).json({ success: false, errors });
  }
};

module.exports = validate;