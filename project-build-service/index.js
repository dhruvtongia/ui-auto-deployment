const { exec } = require("child_process");
const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const mime = require("mime-types");

require("dotenv").config();

const git = simpleGit().clean(simpleGit.CleanOptions.FORCE);
const s3Client = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: "AKIAW3MEDQL66SIV25XA",
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
  });
};

getSourceCode();
