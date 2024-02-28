import { Request, Response, NextFunction } from "express";
import { JWT_SECRET_KEY } from "../config";
import { JwtPayload, verify } from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
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

  next();
};

export default authMiddleware;
