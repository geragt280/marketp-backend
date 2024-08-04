import { Router } from "express";
import ftp from "ftp";

const router = Router();

router.get("/download", (req, res) => {
  const ftpClient = new ftp();
  const fileName = req.query.file?.toString(); // Assuming the file name is passed as a query parameter

  ftpClient.on("ready", () => {
    ftpClient.get(fileName ? fileName : "books.csv", (err, stream) => {
      if (err) {
        res.status(500).send("Error retrieving file");
        ftpClient.end();
        return;
      }

      // Stream the file directly to the response
      stream.pipe(res);

      stream.once("close", () => {
        ftpClient.end();
      });

      // Handle errors during streaming
      stream.on("error", (streamErr : any) => {
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
  });
});

export default router;