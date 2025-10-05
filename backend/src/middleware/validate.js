export function validate(schema, property = 'body') {
  return async (req, res, next) => {
    try {
      const result = await schema.parseAsync(req[property]);
      req[property] = result;
      next();
    } catch (error) {
      const issues = error?.issues?.map((issue) => issue.message) || ['Invalid input'];
      res.status(400).json({ error: 'Validation failed', details: issues });
    }
  };
}
