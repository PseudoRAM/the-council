import { DeepPartial } from "ai";
import { z } from "zod";

// Define the council member schema to match our database
export const councilMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  image_url: z.string().nullable(),
  reason: z.string().nullable(),
  description: z.string().nullable(),
  character_type: z.string().nullable(),
});

export const responseSchema = z.object({
  messages: z.array(
    z.object({
      adviserId: z.string().describe("id of the responding adviser"),
      message: z.string().describe("The adviser's response"),
    })
  ),
});

export type CouncilMember = z.infer<typeof councilMemberSchema>;
export type PartialMessages = DeepPartial<typeof responseSchema>["messages"];
export type Messages = z.infer<typeof responseSchema>["messages"];
