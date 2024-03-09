import express from "express";
import "dotenv/config";
//@ts-ignore
import random from "random-string-generator";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import userRouter from "./routes/userRoutes";
import authMiddleware from "./middlewares/authMiddleware";
import { DeploymentStatus, PrismaClient } from "@prisma/client";
import cors from "cors";
import Redis from "ioredis";
import cron from "node-cron";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/user", userRouter);

const prisma: PrismaClient = new PrismaClient();
const PORT = process.env.PORT || 8000;
const redis = new Redis(
  "rediss://default:AVNS_YTIjVViZIN3Yr5XO7DU@redis-dhruv-vercel-clone-redis.a.aivencloud.com:28074"
);
const ecsClient = new ECSClient({
  region: "eu-north-1",
  credentials: {
    accessKeyId: "AKIAW3MEDQL6WFTCH7O7",
    secretAccessKey: "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",
  },
});

const ecsCofig = {
  CLUSTER:
    "arn:aws:ecs:eu-north-1:471112844029:cluster/vercel-builder-service-cluster",
  TASK: "arn:aws:ecs:eu-north-1:471112844029:task-definition/vercel-code-builder-task",
};

app.post("/project", authMiddleware, async (req, res) => {
  const { repoUrl } = req.body;
  const projectId = random("lowernumeric");

  // Start the container
  const command = new RunTaskCommand({
    cluster: ecsCofig.CLUSTER,
    taskDefinition: ecsCofig.TASK,
    count: 1,
    launchType: "FARGATE",
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [
          "subnet-06fcfbbb45322fdfe",
          "subnet-06d03dca8dd2729cd",
          "subnet-0f1be0709e1b36ce3",
        ],
        securityGroups: ["sg-05409c328cdd324b3"],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "vercel-builder-image",
          environment: [
            {
              name: "GIT_REPO_URL",
              value: repoUrl,
            },
            {
              name: "PROJECT_ID",
              value: projectId,
            },
          ],
        },
      ],
    },
  });

  const deployment = await prisma.deployment.create({
    data: {
      userId: req.body.userId,
      projectId,
    },
  });

  let currentDeploymentLimiter =
    await prisma.currentDeploymentLimiter.findFirst({
      where: {
        userId: req.body.userId,
      },
    });

  if (!currentDeploymentLimiter) {
    currentDeploymentLimiter = await prisma.currentDeploymentLimiter.create({
      data: {
        userId: req.body.userId,
        count: 1,
      },
    });
  } else {
    await prisma.currentDeploymentLimiter.update({
      where: {
        userId: req.body.userId,
      },
      data: {
        count: currentDeploymentLimiter.count + 1,
      },
    });
  }

  try {
    await ecsClient.send(command);
  } catch (e) {
    // removing the deployment entry if we fail to send the biuld request
    console.log("ERROR: ", (e as Error).message);
    await prisma.deployment.delete({
      where: {
        id: deployment.id,
      },
    });

    //reducing the count of the todays deployment
    await prisma.currentDeploymentLimiter.update({
      where: {
        userId: req.body.userId,
      },
      data: {
        count: currentDeploymentLimiter.count - 1,
      },
    });

    return res.status(500).json({
      status: "failed",
      error: "Failed to deploy your project",
    });
  }

  return res.status(201).json({
    status: DeploymentStatus.PENDING,
    projectId,
    url: `http://${projectId}.localhost:8000`,
  });
});

redis.subscribe("deployment-status", (err, count) => {
  if (err) {
    console.log("Error: Failed to subscribe to channel");
  } else {
    console.log("Info: Successfully subscribed to channel");
  }
});

redis.on("message", async (channel, message) => {
  console.log(`Received ${message} from ${channel}`);
  const projectId = JSON.parse(message).id;

  await prisma.deployment.update({
    where: {
      projectId: projectId,
    },
    data: {
      status: DeploymentStatus.DEPLOYED,
    },
  });
});

app.get("/status/:projectId", authMiddleware, async (req, res) => {
  const deployment = await prisma.deployment.findUnique({
    where: {
      projectId: req.params.projectId,
    },
  });

  res.status(200).json({ status: deployment?.status });
});

const resetTodaysDeploymentCount = async () => {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "CurrentDeploymentLimiter" RESTART IDENTITY;`
  );
};

// reset the deplyment count at start of every day
const task = cron.schedule(
  "0 0 * * * ",
  () => {
    console.log("Cron job executed at:", new Date().toLocaleString());
    resetTodaysDeploymentCount();
  },
  {
    scheduled: true,
  }
);

task.on("error", (error) => {
  console.error("Error while scheduling cron job:", error);
});

app.listen(PORT, () => {
  console.log(`Api service running on ${PORT}`);
});
