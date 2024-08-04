import { Request, Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import axios, { AxiosRequestConfig } from "axios";
const {
  WALMART_API_URL,
  WALMART_ASHSTOPSHOP_KEY,
  WALMART_ASHSTOPSHOP_SECRET,
} = require("../../../../../config");
const { getWalmartToken } = require("../../../../services/tokenService");

const router = Router();

const config = {
  auth: {
    username: WALMART_ASHSTOPSHOP_KEY,
    password: WALMART_ASHSTOPSHOP_SECRET,
  },
  headers: {
    "WM_SVC.NAME": "Walmart Marketplace",
    "WM_QOS.CORRELATION_ID": uuidv4(),
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

interface Item {
  mart: string;
  sku: string;
  wpid: string;
  upc: string;
  gtin: string;
  productName: string;
  shelf: string;
  productType: string;
  price: object;
  publishedStatus: string;
  lifecycleStatus: string;
}

interface GetAllItemsQueryParameters {
  nextCursor?: string;
  sku?: string;
  offset?: string;
  limit?: string;
  lifecycleStatus?: string;
  publishedStatus?: string;
  variantGroupId?: string;
  condition?: string;
}

interface WalmartResponse {
  ItemResponse: Item[];
  totalItems: number;
  nextCursor?: string;
}

router.get("/export-listings", async (req: Request, res: Response) => {
  try {
    const token = await getWalmartToken();
    let items: Item[] = [];
    let totalCount: number = 0;
    let callIndex = 1;

    const queryParams: GetAllItemsQueryParameters = {
      nextCursor: '*',
      limit: '5000' //Each cursor call is getting approx 5000 records and increasing in limit may cause error of limitations so its maximum allowed
    };

    const request: AxiosRequestConfig = {
      method: "GET",
      url: `${WALMART_API_URL}/items`,  // Ensure URL is correctly formatted
      ...config,
      headers: {
        ...config.headers,
        "WM_SEC.ACCESS_TOKEN": token,
      },
      params: queryParams,
      responseType: "json",
    };

    do {
      console.log(`Call number: ${callIndex}`);
      //console.log(`Request to API: ${JSON.stringify(request)}`);

      const response = await axios.request(request);
      //console.log(`Response from API: ${JSON.stringify(response.data)}`);

      const data: WalmartResponse = response.data;
      items = items.concat(data.ItemResponse);
      totalCount = data.totalItems;
      request.params.nextCursor = data.nextCursor || undefined;
      callIndex++;
    } while (items.length < totalCount && request.params.nextCursor);

    res.status(200).json({
      data: {
        items,
        totalCount,
      },
      message: 'Items retrieved successfully',
    });
  } catch (error: any) {
    console.error("Error exporting the listings", error.response?.data || error.message);
    res.status(500).json({
      error:
        "An error occurred while exporting the listings: " +
        (error as Error).message,
    });
  }
});

export default router;
