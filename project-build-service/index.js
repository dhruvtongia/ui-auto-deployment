const { exec } = require("child_process");
const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis(
  "rediss://default:AVNS_YTIjVViZIN3Yr5XO7DU@redis-dhruv-vercel-clone-redis.a.aivencloud.com:28074"
);
const git = simpleGit().clean(simpleGit.CleanOptions.FORCE);
const s3Client = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: "AKIAW3MEDQL6WFTCH7O7",
    secretAccessKey: "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",
  },
});

const getSourceCode = async () => {
  const gitRepo = process.env.GIT_REPO_URL;
  console.log(`fetching the source from git repo: ${gitRepo}`);

  const localPath = path.join(__dirname, `output`);
  await git.clone(gitRepo, localPath);

  const currentProcess = exec(
    `cd ${localPath} && npm install && npm run build`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      console.log(`stdout: ${stdout}`);
    }
  );

  currentProcess.on("close", async () => {
    const folderPath = path.join(__dirname, "output", "dist");
    const allFilesPath = fs.readdirSync(folderPath, { recursive: true });

    for (const file of allFilesPath) {
      const filePath = path.join(folderPath, file);

      if (!fs.lstatSync(filePath).isDirectory()) {
        console.log("INFO-> uploading files to S3....");
        const command = new PutObjectCommand({
          Bucket: "vercel-output-bucket",
          Key: `__output/${process.env.PROJECT_ID}/${file}`,
          Body: fs.createReadStream(filePath),
          ContentType: mime.contentType(filePath),
        });

        try {
          await s3Client.send(command);
          console.log("INFO-> successfully uploaded to S3");
        } catch (err) {
          console.log("Error-> failed to upload ", err);
          console.error(err);
        }
      }
    }

    console.log("INFO-> successfully uploaded all the files to S3");
    redis.publish(
      "deployment-status",
      JSON.stringify({
        status: "deployed",
        id: process.env.PROJECT_ID,
      })
    );
    redis.quit(() => {
      console.log("closing the redis connection.");
    });
  });
};

getSourceCode();
