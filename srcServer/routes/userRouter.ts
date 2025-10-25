import express from "express";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../data/dynamodb.js";
import type { Response,Request } from "express";

const router = express.Router();


router.get("/", async (req:Request, res:Response) => {
  try {

const params = {
  TableName: "chappy",
  FilterExpression: "begins_with(pk, :prefix)",
  ExpressionAttributeValues: { ":prefix": "USER#" }
};


    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json(data.Items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not find users" });
  }
});

export default router;