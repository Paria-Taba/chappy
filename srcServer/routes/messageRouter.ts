import express from "express";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../data/dynamodb.js";
import { verifyToken } from "../auth/auth.js";

const router = express.Router();
router.use(express.json());

interface DMMessage {
  pk: string;
  sk: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

// Send direct message
router.post("/", verifyToken, async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  if (!senderId || !receiverId || !content) return res.status(400).json({ error: "Missing fields" });

  const timestamp = new Date().toISOString();
  const messageId = `DM#${senderId}#${receiverId}#${Date.now()}`;

  const params = {
    TableName: "chappy",
    Item: { pk: messageId, sk: `MESSAGE#${messageId}`, senderId, receiverId, content, timestamp }
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    res.status(201).json({ message: "DM sent", data: params.Item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not send DM" });
  }
});

// Get direct messages between two users
router.get("/:user1/:user2", verifyToken, async (req, res) => {
  const { user1, user2 } = req.params;
  
  const params = {
    TableName: "chappy",
    FilterExpression: "(senderId = :u1 AND receiverId = :u2) OR (senderId = :u2 AND receiverId = :u1)",
    ExpressionAttributeValues: { ":u1": user1, ":u2": user2 }
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json(data.Items ?? []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch DMs" });
  }
});



router.post("/:channelId/message", verifyToken, async (req, res) => {
  const { channelId } = req.params;
  const { content, senderId } = req.body;
  if (!content || !senderId) return res.status(400).json({ error: "Missing fields" });

  const timestamp = new Date().toISOString();
  const messageId = `CHANNEL#${channelId}#MSG#${Date.now()}`;

  const params = {
    TableName: "chappy",
    Item: { pk: `CHANNEL#${channelId}`, sk: messageId, content, senderId, timestamp }
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    res.status(201).json({ message: "Message sent", data: params.Item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not send message" });
  }
});

// Get messages
router.get("/:channelId/messages", verifyToken, async (req, res) => {
  const { channelId } = req.params;

  const params = {
    TableName: "chappy",
    FilterExpression: "pk = :pk AND begins_with(sk, :msgPrefix)",
    ExpressionAttributeValues: { ":pk": `CHANNEL#${channelId}`, ":msgPrefix": "CHANNEL#" }
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json(data.Items ?? []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch messages" });
  }
});

export default router;
