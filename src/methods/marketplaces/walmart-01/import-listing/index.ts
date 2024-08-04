//IMP: This file of import listing will be use for inserting as well as updateding the bulk and single listing import.

import { Request, response, Response, Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import csv from "csv-parser";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import FormData from "form-data";
const {
  WALMART_API_URL,
  WALMART_ASHSTOPSHOP_KEY,
  WALMART_ASHSTOPSHOP_SECRET,
} = require("../../../../../config");
const { upload } = require("../../../../config/multerConfig");
const { getWalmartToken } = require("../../../../services/tokenService");

const router = Router();

interface CsvData {
  [key: string]: string;
}

const config = {
  auth: {
    username: WALMART_ASHSTOPSHOP_KEY,
    password: WALMART_ASHSTOPSHOP_SECRET,
  },
  headers: {
    "WM_SVC.NAME": "Walmart Marketplace",
    "WM_QOS.CORRELATION_ID": uuidv4(),
  },
};

// refer validate
// refer map-request
// refer map-response
// refer api-communicator

// Walmart01(request){
//
// validate(request)
// thirdPartyRequest = mapRequest(request)
// response = axios.request(thirdPartyRequest)  //from API communicator
//

router.post(
  "/import-listing",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "..",
      req.file.path
    );
    const results: CsvData[] = [];

    // fs.createReadStream(filePath)
    //   .pipe(csv())
    //   .on("data", (data) => results.push(data))
    //   .on("end", () => {
    //     // Delete the file after processing
    //     fs.unlink(filePath, (err) => {
    //       if (err) {
    //         console.error("Failed to delete file:", err);
    //       }
    //     });

    //     res.json(results);
    //   });
    // const pathdir = __dirname + "/feed.xml";
    console.log("path", filePath);
    // const feed = fs.readFileSync(filePath, "utf8");
    const accessToken = await getWalmartToken();
    const form = new FormData();
    
    const fileStream = fs.createReadStream('F:/Currently Working Projects/marketp/backend/uploads/1720888994100-items.json');
    console.log(fileStream);
    form.append("file", fileStream , {
      filename: "1720888994100-items.json",
      contentType: "application/json",
    });

    try {
      const response = await axios.post(
        "https://sandbox.walmartapis.com/v3/feeds",
        form,
        {
          ...config,
          headers: {
            ...config.headers,
            "WM_SEC.ACCESS_TOKEN": accessToken,
            ...form.getHeaders(),
          },
          params: {
            feedType: "MP_ITEM",
          },
        }
      );
      res.status(200).json(response);
    } catch (error: any) {
      console.error("Failed to bulk add:", error);
      console.error("Error expand", error.response);
      console.error("Error max expand", error.response.data);
    }
  }
);

const feedContent = `{
  "MPItemFeedHeader": {
    "sellingChannel": "marketplace",
    "processMode": "REPLACE",
    "subset": "EXTERNAL",
    "locale": "en",
    "version": "4.8",
    "subCategory": "home_other"
  },
  "MPItem": [
    {
      "Orderable": {
        "sku": "3289579058",
        "productIdentifiers": {
          "productIdType": "GTIN",
          "productId": "06146190200012"
        },
        "productName": "Ying Yang Apron, Abstract Graphic Design Yin Yang Circle Black and White Dots Pattern Cosmos and Energy, Unisex Kitchen Bib with Adjustable Neck for Cooking Gardening, Adult Size, Red, by Ambesonne",
        "brand": "davidson",
        "price": 1,
        "ShippingWeight": 1,
        "MustShipAlone": "No"
      },
      "Visible": {
        "Home Decor, Kitchen, & Other": {
          "shortDescription": "shelf",
          "mainImageUrl": "https://i5-qa.walmartimages.com/asr/9e9d04d1-6520-448e-b336-f40b7fb98707.c4c99539377709c2a9e332558177be8b.jpeg",
          "keyFeatures": [
            "@generated"
          ]
        }
      }
    }
  ]
}`;

// return mapResponse(response)
//}
// 1 line :  from validate.ts
// 2 line :

export default router;
