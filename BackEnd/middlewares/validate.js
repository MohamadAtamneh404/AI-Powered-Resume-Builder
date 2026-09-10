// BackEnd/middlewares/validate.js

/**
 * A lightweight validation middleware.
 * @param {Object} schema - Key-value pairs where key is the field name, and value is a validation rule or string type.
 *                          Example: { email: 'string', password: 'string', age: 'number' }
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    for (const [key, type] of Object.entries(schema)) {
      const value = req.body[key];

      const isOptional = type.endsWith("?");
      const baseType = isOptional ? type.slice(0, -1) : type;

      if (
        value === undefined ||
        value === null ||
        (baseType === "string" && value.trim() === "")
      ) {
        if (!isOptional) {
          errors.push(`Field '${key}' is required and cannot be empty`);
        }
        continue;
      }

      // Basic type checking
      if (baseType === "array" && !Array.isArray(value)) {
        errors.push(`Field '${key}' must be an array`);
      } else if (baseType !== "array" && typeof value !== baseType) {
        errors.push(`Field '${key}' must be of type ${baseType}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    next();
  };
};

module.exports = validate;
