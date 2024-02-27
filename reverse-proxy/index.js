const express = require("express");
const { S3 } = require("aws-sdk");

const s3 = new S3({
  accessKeyId: "AKIAW3MEDQL66SIV25XA",
  secretAccessKey: "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",
  Bucket: "vercel-output-bucket",
});

const app = express();

app.get("/*", async (req, res) => {
  // id.100xdevs.com
  const host = req.hostname;

  const id = host.split(".")[0];
  const filePath = req.path;

  const contents = await s3
    .getObject({
      Bucket: "vercel-output-bucket",
      Key: `__output/${id}${filePath}`,
    })
    .promise();

  const type = filePath.endsWith("html")
    ? "text/html"
    : filePath.endsWith("css")
    ? "text/css"
    : "application/javascript";
  res.set("Content-Type", type);

  res.send(contents.Body);
});

app.listen(3001);
