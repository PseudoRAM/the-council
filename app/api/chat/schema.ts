import { DeepPartial } from "ai";
import { z } from "zod";

export const responseSchema = z.object({
  messages: z.array(
    z.object({
      adviserId: z.string().describe("id of the responding adviser"),
      message: z.string().describe("The adviser's response"),
    })
  ),
});

// define a type for the partial notifications during generation
export type PartialMessages = DeepPartial<typeof responseSchema>["messages"];

export type Messages = z.infer<typeof responseSchema>["messages"];
