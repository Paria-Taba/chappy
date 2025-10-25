import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";


const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error("AWS_REGION, AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is missing in .env");
}

const client = new DynamoDBClient({
  region, 
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

export const ddbDocClient = DynamoDBDocumentClient.from(client);
