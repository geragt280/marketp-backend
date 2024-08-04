import express, { Request, Response } from "express";
import cors from "cors";
const { PORT } = require("./config");
import walmartExportListingRouter from "./src/methods/marketplaces/walmart-01/export-listing";
import walmartImportListingRouter from "./src/methods/marketplaces/walmart-01/import-listing";
import alphabroder from "./src/methods/vendors/alphabroder/index";

const app = express();
const port = PORT;

app.use(cors());

app.use("/api/walmart/export", walmartExportListingRouter);
app.use("/api/walmart/import", walmartImportListingRouter);
app.use("/api/alphabroder", alphabroder);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Node.js!");
});

app.listen(port, () => {
  console.log(`HTTP server is running at http://localhost:${port}`);
});

