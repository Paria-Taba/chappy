import { z } from "zod";
export const createChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required"),
  isLocked: z.boolean(),
  createdBy: z.string().min(1, "createdBy is required"),
});