import { Router } from "express";
import ftp from "ftp";

const router = Router();

router.get("/download", (req, res) => {
  const ftpClient = new ftp();
  const filePath = "/Demo/AllDBInfoALP_Prod.xls"; // Fixed file path
  const downloadFileName = "AllDBInfoALP_Prod.xls"; // The name the client will see

  ftpClient.on("ready", () => {
    console.log("ftp fetching");

    ftpClient.get(filePath, (err, stream) => {
      if (err) {
        res.status(500).send("Error retrieving file");
        ftpClient.end();
        return;
      }

      // Set the headers to prompt the client to download the file
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${downloadFileName}`
      );
      res.setHeader("Content-Type", "application/vnd.ms-excel");

      // Stream the file directly to the response
      stream.pipe(res);

      stream.once("close", () => {
        ftpClient.end();
      });

      // Handle errors during streaming
      stream.on("error", (streamErr) => {
        res.status(500).send("Error streaming file");
        ftpClient.end();
      });
    });
  });

  // Connect to the FTP server
  ftpClient.connect({
    host: "138-128-244-188.cloud-xip.com",
    user: "alphabroder",
    password: "alpha123",
    secure: true, // This enables TLS/SSL
    secureOptions: { rejectUnauthorized: false }, // This is necessary if the server uses a self-signed certificate
  });
});

export default router;
