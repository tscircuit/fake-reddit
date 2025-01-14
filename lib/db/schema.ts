import { z } from "zod"

// When defining your database schema, try to use snake case for column names.

export const thingSchema = z.object({
  thing_id: z.string(),
  name: z.string(),
  description: z.string(),
})
export type Thing = z.infer<typeof thingSchema>

export const postSchema = z.object({
  id: z.string(),
  name: z.string(),
  subreddit: z.string(),
  title: z.string(),
  kind: z.enum(["self", "link"]),
  text: z.string(),
  url: z.string(),
  created_utc: z.number(),
  author: z.string(),
  score: z.number(),
  ups: z.number(),
  downs: z.number(),
})
export type Post = z.infer<typeof postSchema>

export const databaseSchema = z.object({
  idCounter: z.number().default(0),
  things: z.array(thingSchema).default([]),
  posts: z.array(postSchema).default([]),
})
export type DatabaseSchema = z.infer<typeof databaseSchema>
