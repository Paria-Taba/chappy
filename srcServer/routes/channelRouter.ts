// src/routes/channelRouter.ts
import express from "express";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../data/dynamodb.js";
import type { Response, Request } from "express";
import { createChannelSchema } from "../validering/channelValidate.js";
import { verifyToken } from "../auth/auth.js";

const router = express.Router();
router.use(express.json());

/* ---------------------- INTERFACES ---------------------- */
interface Channel {
  pk: string; // CHANNEL#timestamp
  sk: string; // METADATA
  name: string;
  isLocked: boolean;
  createdBy: string;
  createdAt: string;
}

interface ChannelMessage {
  pk: string; // CHANNEL#timestamp
  sk: string; // MESSAGE#timestamp#senderId
  senderId: string;
  content: string;
  timestamp: string;
}

/* ---------------------- CHANNEL ROUTES ---------------------- */

// GET all channels
router.get("/", verifyToken, async (req: Request, res: Response<Channel[] | { error: string }>) => {
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
    res.status(500).json({ error: "Could not fetch channels" });
  }
});

// POST create a new channel
router.post("/", verifyToken, async (req: Request<{}, {}, unknown>, res: Response<{ message: string; channel?: Channel } | { error: string }>) => {
  try {
    const parsed = createChannelSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid channel data" });

    const { name, isLocked, createdBy } = parsed.data;
    const createdAt = new Date().toISOString();
    const channelId = `CHANNEL#${Date.now()}`; // timestamp ID

    const params = {
      TableName: "chappy",
      Item: { pk: channelId, sk: "METADATA", name, isLocked, createdBy, createdAt },
    };

    await ddbDocClient.send(new PutCommand(params));
    res.status(201).json({ message: "Channel created successfully", channel: params.Item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create channel" });
  }
});

// DELETE a channel
router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const loggedInUser = (req as any).user.userName;

  if (!id) return res.status(400).json({ error: "Channel ID is required" });

  try {
    const channelData = await ddbDocClient.send(new GetCommand({
      TableName: "chappy",
      Key: { pk: id, sk: "METADATA" },
    }));

    const channel = channelData.Item;
    if (!channel) return res.status(404).json({ error: "Channel not found" });
    if (channel.createdBy !== loggedInUser) return res.status(403).json({ error: "You can only delete your own channel" });

    await ddbDocClient.send(new DeleteCommand({ TableName: "chappy", Key: { pk: id, sk: "METADATA" } }));
    res.json({ message: "Channel deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete channel" });
  }
});

/* ---------------------- MESSAGE ROUTES ---------------------- */

// GET all messages in a channel
router.get("/:id/messages", verifyToken, async (req: Request, res: Response<ChannelMessage[] | { error: string }>) => {
  const { id } = req.params;

  try {
    const params = {
      TableName: "chappy",
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
      ExpressionAttributeValues: { ":pk": id, ":prefix": "MESSAGE#" },
      ScanIndexForward: true, // ascending order
    };

    const data = await ddbDocClient.send(new QueryCommand(params));
    const messages = (data.Items ?? []) as ChannelMessage[];
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST a message to a channel
router.post("/:id/messages", verifyToken, async (req: Request, res: Response<{ message: string; msg?: ChannelMessage } | { error: string }>) => {
  const { id } = req.params;
  const { content } = req.body;
  const senderId = (req as any).user.userName;

  if (!content) return res.status(400).json({ error: "Content is required" });

  try {
    const timestamp = new Date().toISOString();
    const sk = `MESSAGE#${timestamp}#${senderId}`;

    const params = {
      TableName: "chappy",
      Item: { pk: id, sk, senderId, content, timestamp },
    };

    await ddbDocClient.send(new PutCommand(params));
    res.status(201).json({ message: "Message sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
