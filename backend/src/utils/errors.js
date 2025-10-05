export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function handleError(res, error, fallback = 'Unexpected error') {
  console.error(error);
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: error.message });
  }
  res.status(500).json({ error: fallback });
}
