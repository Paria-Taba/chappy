import express from "express";
import { DeleteCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../data/dynamodb.js";
import type { Response,Request } from "express";
import { createUserSchema } from "../validering/userValidate.js";
import bcrypt from "bcrypt"

const router = express.Router();
router.use(express.json()); 
 
interface User {
  pk: string;
  sk: string;
  userName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

//GET /users
router.get("/", async (req:Request, res:Response<User[] | { error: string }>) => {
  try {

const params = {
  TableName: "chappy",
  FilterExpression: "begins_with(pk, :prefix)",
  ExpressionAttributeValues: { ":prefix": "USER#" }
};


    const data = await ddbDocClient.send(new ScanCommand(params));
	 // Hantera om Items är undefined
    const items = (data.Items ?? []) as User[];
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not find users" });
  }
});

//POST /users
interface CreateUserBody {
  userName: string;
  email: string;
  password: string;
}

router.post("/", async (req: Request<{}, {}, CreateUserBody>, res: Response <{ message: string; user: User } | { message?: string; error?: string }>) => {
  try {

	const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message:"User validate has problem"});
    }

    const { userName, email, password } = parsed.data;

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create PK/SK
    const pk = `USER#${userName}`;
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

// DELETE /users/:id
router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const params = {
      TableName: "chappy",
      Key: {
        pk: `USER#${id}`,
        sk: "PROFILE",
      },
    };

    await ddbDocClient.send(new DeleteCommand(params));

    res.status(200).json({ message: `User with id ${id} deleted successfully.` });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Could not delete user" });
  }
});


export default router;