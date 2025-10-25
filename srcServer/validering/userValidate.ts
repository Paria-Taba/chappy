import { z } from "zod";
export const createUserSchema = z.object({
  userName: z.string().min(2, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(3, "Password must be at least 6 characters")
});