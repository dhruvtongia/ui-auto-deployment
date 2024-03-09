import { Request, Response, NextFunction } from "express";
import { JWT_SECRET_KEY } from "../config";
import { JwtPayload, verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const headerToken = req.headers.authorization;
  if (!headerToken) {
    return res.status(400).json({
      error: "Invalid token format",
    });
  }
  const tokens: string[] = headerToken.split(" ");
  if (tokens.length != 2) {
    return res.status(400).json({
      error: "Invalid token format",
    });
  }
  try {
    const verifedUser: JwtPayload = verify(
      tokens[1],
      JWT_SECRET_KEY
    ) as JwtPayload;
    req.body.userId = verifedUser["userId"];
  } catch (e) {
    console.log("error: ", (e as Error).message);
    return res.status(500).json({ message: "failed to validate user" });
  }

  const currentDeploymentLimiter =
    await prisma.currentDeploymentLimiter.findFirst({
      where: {
        userId: req.body.userId,
      },
    });

  if (!currentDeploymentLimiter || currentDeploymentLimiter.count < 2) {
    next();
  } else
    [
      res.status(429).json({
        error:
          "Reached today's maximum deployment count of 2. Please try after 24 hours...",
      }),
    ];
};

export default authMiddleware;
