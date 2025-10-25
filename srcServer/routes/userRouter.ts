import express from "express";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../data/dynamodb.js";
import type { Response,Request } from "express";
import { createUserSchema } from "../validering/userValidate.js";
import bcrypt from "bcrypt"

const router = express.Router();
router.use(express.json()); 
 

//GET /users
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

//POST /users
router.post("/", async (req: Request, res: Response) => {
  try {

	const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message:"User validate has problem"});
    }

    const { userName, email, password } = parsed.data;

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create PK/SK
    const pk = `USER#${Date.now()}`;
    const sk = "PROFILE";
    const createdAt = new Date().toISOString();

    const params = {
      TableName: "chappy",
      Item: {
        pk,
        sk,
        userName,
        email,
        passwordHash,
        createdAt
      }
    };

    await ddbDocClient.send(new PutCommand(params));

    res.status(201).json({ message: "User created", user: { pk,sk, userName, email,passwordHash,createdAt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create user" });
  }
});
export default router;