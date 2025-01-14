import { z } from "zod"

export const submitSchema = z.object({
  sr: z.string().optional(),
  subreddit: z.string().optional(),
  title: z.string(),
  kind: z.enum(["self", "link"]).default("self"),
  text: z.string().optional(),
  url: z.string().url().optional(),
  api_type: z.string().default("json"),
  extension: z.string().optional(),
  resubmit: z.boolean().default(true),
  send_replies: z.boolean().default(true),
  star_count: z.number().optional(),
  owner_name: z.string().optional(),
  description: z.string().optional(),
  code: z.string().optional(),
  snippet_type: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type SubmitRequest = z.infer<typeof submitSchema>
