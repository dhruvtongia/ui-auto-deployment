import express from "express";
import "dotenv/config";
//@ts-ignore
import { UniqueString } from "unique-string-generator";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import userRouter from "./routes/userRoutes";
import authMiddleware from "./middlewares/authMiddleware";
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(express.json());
app.use("/api/user", userRouter);

const prisma: PrismaClient = new PrismaClient();
const PORT = process.env.PORT || 8000;

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
  const projectId = UniqueString();

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

  try {
    await ecsClient.send(command);
  } catch (e) {
    // removing the deployment entry if we fail to send the biuld request
    await prisma.deployment.delete({
      where: {
        id: deployment.id,
      },
    });

    return res.status(500).json({
      status: "failed",
      error: "Failed to deploy your project",
    });
  }

  return res.status(201).json({
    status: "queued",
    data: { projectId, url: `http://${projectId}.localhost:8000` },
  });
});

app.listen(PORT, () => {
  console.log(`Api service running on ${PORT}`);
});
