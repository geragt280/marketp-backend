import axios from "axios";
import fs from "fs";
import path from "path";
const {
  WALMART_API_URL,
  WALMART_API_KEY,
  WALMART_API_SECRET,
} = require("../../config");
import { v4 as uuidv4 } from "uuid";

const tokenFilePath = path.join(__dirname, "token.json");

const TOKEN_URL = WALMART_API_URL + "/token";
const VERIFY_TOKEN_URL = WALMART_API_URL + "/token/detail";

const config = {
  auth: {
    username: WALMART_API_KEY,
    password: WALMART_API_SECRET,
  },
  headers: {
    "WM_SVC.NAME": "Walmart Marketplace",
    "WM_QOS.CORRELATION_ID": uuidv4(),
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

const params = new URLSearchParams();
params.append("grant_type", "client_credentials");


export const getWalmartToken = async () => {
  try {
    if (fs.existsSync(tokenFilePath)) {
      const tokenData = JSON.parse(fs.readFileSync(tokenFilePath, "utf-8"));
      if (Date.now() < tokenData.expire_at) {
        const isValid = await verifyToken(tokenData.token);
        if (isValid) {
          console.log("using old token");
          return tokenData.token;
        }
      }
    }
    return await fetchWalmartToken();
  } catch (error) {
    console.error("Error getting token:", error);
    throw new Error("Error getting token");
  }
};

const fetchWalmartToken = async () => {
  console.log("getting new token");
  try {
    const response = await axios.post(TOKEN_URL, params, config);

    const tokenData = {
      token: response.data.access_token,
      expire_at: Date.now() + response.data.expires_in * 1000,
    };

    fs.writeFileSync(tokenFilePath, JSON.stringify(tokenData));
    return tokenData.token;
  } catch (error: any) {
    console.error("Error fetching token:", {
      status: error.response.status,
      statusText: error.response.statusText,
      ...error.response,
    });
    throw new Error("Error fetching token");
    // return {
    //   status: error.response.status,
    //   statusText: error.response.statusText,
    //   ...error.response.data,
    // };
  }
};

const verifyToken = async (token: string) => {
  const config = {
    auth: {
      username: WALMART_API_KEY,
      password: WALMART_API_SECRET,
    },
    headers: {
      "WM_SVC.NAME": "Walmart Marketplace",
      "WM_QOS.CORRELATION_ID": uuidv4(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  try {
    const response = await axios.get(VERIFY_TOKEN_URL, {
      ...config,
      headers: {
        ...config.headers,
        "WM_SEC.ACCESS_TOKEN": token
      }
    });

    return response.data.is_valid;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
};
