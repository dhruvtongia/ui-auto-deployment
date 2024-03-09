import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rateLimitMiidleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentDeploymentLimiter =
    await prisma.currentDeploymentLimiter.findFirst({
      where: {
        userId: req.body?.userId,
      },
    });

  if (!currentDeploymentLimiter || currentDeploymentLimiter.count < 2) {
    next();
  } else {
    res.status(429).json({
      error:
        "Reached today's maximum deployment count of 2. Please try after 24 hours...",
    });
  }
};

export default rateLimitMiidleware;
