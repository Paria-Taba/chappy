import express from "express";
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../data/dynamodb.js";
import type { Response,Request } from "express";
import { createChannelSchema } from "../validering/channelValidate.js";
import { verifyToken } from "../auth/auth.js";


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
router.get("/",verifyToken, async (req: Request, res: Response<Channel[] | { error: string }>) => {
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
  "/",verifyToken,
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

// DELETE /channels
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const loggedInUser = (req as any).user.userName;

  try {
    const channelData = await ddbDocClient.send(
      new GetCommand({ TableName: "chappy", Key: { pk: id, sk: "METADATA" } })
    );
    if (!channelData.Item) return res.status(404).json({ error: "Channel not found" });
    if (channelData.Item.createdBy !== loggedInUser)
      return res.status(403).json({ error: "You can only delete your own channel" });

    await ddbDocClient.send(new DeleteCommand({ TableName: "chappy", Key: { pk: id, sk: "METADATA" } }));

    res.json({ message: "Channel deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete channel" });
  }
});

export default router