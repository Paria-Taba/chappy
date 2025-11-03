import express from "express";
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../data/dynamodb.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUserSchema } from "../validering/userValidate.js";
import { verifyToken } from "../auth/auth.js";

const router = express.Router();
router.use(express.json());

interface User {
  pk: string;
  sk: string;
  userName: string;
  passwordHash: string;
  createdAt: string;
}

// GET all users
router.get("/", async (req, res) => {
  try {
    const params = {
      TableName: "chappy",
      FilterExpression: "begins_with(pk, :prefix)",
      ExpressionAttributeValues: { ":prefix": "USER#" },
    };
    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json(data.Items ?? []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch users" });
  }
});

// DELETE user
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const loggedInUser = (req as any).user.userName;

  if (loggedInUser !== id) {
    return res.status(403).json({ error: "You can only delete your own account." });
  }

  try {
    const params = {
      TableName: "chappy",
      Key: { pk: `USER#${id}`, sk: "PROFILE" },
    };
    await ddbDocClient.send(new DeleteCommand(params));
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user." });
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid user data" });

  const { username, password } = parsed.data;
  const existingUser = await ddbDocClient.send(
    new GetCommand({ TableName: "chappy", Key: { pk: `USER#${username}`, sk: "PROFILE" } })
  );

  if (existingUser.Item) return res.status(400).json({ error: "Username exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = { pk: `USER#${username}`, sk: "PROFILE", userName: username, passwordHash, createdAt: new Date().toISOString() };
  await ddbDocClient.send(new PutCommand({ TableName: "chappy", Item: newUser }));

  res.status(201).json({ message: "User registered", user: newUser });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) return res.status(400).json({ error: "Username and password required" });

  const data = await ddbDocClient.send(
    new ScanCommand({
      TableName: "chappy",
      FilterExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": `USER#${userName}` },
    })
  );

  const user = data.Items?.[0];
  if (!user) return res.status(404).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "Incorrect password" });

  const token = jwt.sign({ userName }, process.env.JWT_SECRET || "secretkey", { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

export default router;
