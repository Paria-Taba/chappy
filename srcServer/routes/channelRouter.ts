import express from "express";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../data/dynamodb.js";
import type { Response,Request } from "express";
import { createChannelSchema } from "../validering/channelValidate.js";


const router = express.Router();
router.use(express.json()); 

interface Channel {
  pk: string;
  sk: string; 
  name: string;
  isLocked: boolean;
  createdBy: string;
  createdAt: string;
}

// GET /channels
router.get("/", async (req: Request, res: Response<Channel[] | { error: string }>) => {
  try {
    const params = {
      TableName: "chappy",
      FilterExpression: "begins_with(pk, :prefix) AND sk = :sk",
      ExpressionAttributeValues: {
        ":prefix": "CHANNEL#",
        ":sk": "METADATA",
      },
    };

    const data = await ddbDocClient.send(new ScanCommand(params));
    const channels = (data.Items ?? []) as Channel[];
    res.json(channels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not find channels" });
  }
});


// POST /channels
interface CreateChannelBody {
  name: string;
  isLocked: boolean;
  createdBy: string;
}

router.post(
  "/",
  async (req: Request<{}, {}, unknown>, res: Response<{ message: string; channel?: any } | { error: string }>) => {
    try {
      // Validate request body with Zod
      const parsed = createChannelSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({message:"Is not valid"});
      }

      const { name, isLocked, createdBy } = parsed.data;

      const createdAt = new Date().toISOString();

      // Generate a unique channel ID
      const channelId = `CHANNEL#${Date.now()}`;

      const params = {
        TableName: "chappy",
        Item: {
          pk: channelId,
          sk: "METADATA",
          name,
          isLocked,
          createdBy,
          createdAt,
        },
      };

      await ddbDocClient.send(new PutCommand(params));

      res.status(201).json({ message: "Channel created successfully", channel: params.Item });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not create channel" });
    }
  }
);
export default router