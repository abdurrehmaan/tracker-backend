import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Default error
  let error = { ...err };
  error.message = err.message;

  // PostgreSQL duplicate key error
  if (err.code === "23505") {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }

  // PostgreSQL foreign key constraint error
  if (err.code === "23503") {
    const message = "Invalid reference to related data";
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
