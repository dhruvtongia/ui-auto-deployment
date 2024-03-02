import { Router, Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
import { sign } from "jsonwebtoken";
import zod from "zod";
import { JWT_SECRET_KEY } from "../config";

const router: Router = Router();
const prismaClient: PrismaClient = new PrismaClient();
const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
);
const userValidation = zod.object({
  username: zod.string().email(),
  password: zod.string().min(8).regex(passwordValidation),
});

router.post("/signup", async (req: Request, res: Response) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
  };

  const isSuccess = userValidation.safeParse(user);
  console.log(isSuccess.success);

  if (!isSuccess.success) {
    console.log("Error: ", isSuccess.error.errors[0].message);
    return res
      .status(411)
      .json({ error: "Incorrect format for username or password" });
  }

  const existingUser = await prismaClient.user.findFirst({
    where: {
      username: user.username,
    },
  });

  if (existingUser) {
    return res.status(411).json({ error: "User already exists." });
  }

  const newUser = await prismaClient.user.create({
    data: {
      username: req.body.username,
      password: req.body.password,
    },
  });

  const token: string = generateToken(newUser);

  return res.status(200).json({
    message: "User created successfully",
    token,
  });
});

router.post("/signin", async (req: Request, res: Response) => {
  console.log("INFO: inside signin method for req: ", req.body);
  const user = {
    username: req.body.username,
    password: req.body.password,
  };
  const isSuccess = userValidation.safeParse(user);

  if (!isSuccess) {
    return res
      .status(411)
      .json({ error: "Incorrect format for username or password" });
  }

  const existingUser = await prismaClient.user.findFirst({
    where: {
      username: user.username,
    },
  });

  if (!existingUser) {
    return res.status(404).json({ error: "No User found." });
  }

  if (existingUser.password !== user.password) {
    return res.status(400).json({ error: "Wrong password" });
  }

  const token: string = generateToken(existingUser);

  return res.status(200).json({
    message: "User logged in successfully",
    token,
  });
});

const generateToken = (user: User): string => {
  return sign({ userId: user.id }, JWT_SECRET_KEY);
};

export default router;
