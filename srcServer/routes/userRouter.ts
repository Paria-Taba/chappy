import express from "express";
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../data/dynamodb.js";
import type { Response,Request } from "express";
import { createUserSchema } from "../validering/userValidate.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
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
  password: string;
}



// DELETE /users/:id
router.delete("/:id", verifyToken, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const loggedInUser = (req as any).user.userName;

    if (loggedInUser !== id) {
      return res.status(403).json({ error: "You can only delete your own account." });
    }

    const params = {
      TableName: "chappy",
      Key: {
        pk: `USER#${id}`,
        sk: "PROFILE",
      },
    };

    await ddbDocClient.send(new DeleteCommand(params));
    res.status(200).json({ message: `User ${id} deleted successfully.` });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Could not delete user" });
  }
});


// POST /register

 async function getUserByUsername(username: string) {
  const params = {
    TableName: "chappy",
    Key: {
      pk: `USER# ${username}`,
      sk: "PROFILE",
    },
  };
  const data = await ddbDocClient.send(new GetCommand(params));
  return data.Item || null;
}

async function createUser(user: { username: string; passwordHash: string; createdAt: string }) {
  const { username, passwordHash, createdAt } = user;
  const params = {
    TableName: "chappy",
    Item: {
      pk: `USER# ${username}`,
      sk: "PROFILE",
      userName: username,
      passwordHash,
      createdAt,
    },
  };
  await ddbDocClient.send(new PutCommand(params));
  return params.Item;
}


router.post("/register", async (req, res) => {
  try {
    // --- Validate input using Zod ---
    const parsed = createUserSchema.safeParse(req.body);
     if (!parsed.success) {
      return res.status(400).json({ error: "Invalid user data" });
    }

    const { username, password } = parsed.data;

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({
      username,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
    });


    res.status(201).json({
      message: "User registered successfully.",
      user: newUser,
      
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed due to a server error." });
  }
}); 


// POST /login
router.post("/login", async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const params = {
      TableName: "chappy",
      FilterExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": `USER# ${userName}` }
    };
    const data = await ddbDocClient.send(new ScanCommand(params));
    const user = data.Items?.[0];

    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Incorrect password" });

    // Generate token
    const token = jwt.sign(
      { userName: user.userName },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});


export default router;