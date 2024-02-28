const express = require("express");
const { generateSlug } = require("random-word-slugs");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;

const ecsClient = new ECSClient({
  region: "eu-north-1",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});

const ecsCofig = {
  CLUSTER:
    "arn:aws:ecs:eu-north-1:471112844029:cluster/vercel-builder-service-cluster",
  TASK: "arn:aws:ecs:eu-north-1:471112844029:task-definition/vercel-code-builder-task",
};

app.post("/project", async (req, res) => {
  const { repoUrl } = req.body;
  const projectId = generateSlug();

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

  await ecsClient.send(command);

  return res.json({
    status: "queued",
    data: { projectId, url: `http://${projectId}.localhost:8000` },
  });
});

app.listen(PORT, () => {
  console.log(`Api service running on ${PORT}`);
});
