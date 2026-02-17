import { z } from "zod";

export const chainIdSchema = z.enum(["1", "56"]);

export type ChainId = z.infer<typeof chainIdSchema>;
