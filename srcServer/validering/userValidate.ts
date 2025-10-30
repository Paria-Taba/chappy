import { z } from "zod";
export const createUserSchema = z.object({
  userName: z.string().min(2, "Username must be at least 3 characters"),
  password: z.string().min(3, "Password must be at least 6 characters")
});