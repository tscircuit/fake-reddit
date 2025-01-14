import { withRouteSpec } from "lib/middleware/with-winter-spec"
import type { WinterRequest, WinterContext } from "lib/types"
import { z } from "zod"
import type { Post } from "lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  queryParams: z.object({
    id: z.string().optional().describe("A comma-separated list of thing fullnames"),
    url: z.string().optional().describe("URL to search for"),
    sr_name: z.string().optional().describe("Subreddit name"),
    after: z.string().optional().describe("Fullname of next page"),
    before: z.string().optional().describe("Fullname of previous page"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().describe("Maximum number of items to return"),
    count: z.string().regex(/^\d+$/).transform(Number).optional().describe("Number of items already seen"),
  }),
  jsonResponse: z.object({
    kind: z.literal("Listing"),
    data: z.object({
      after: z.string().nullable(),
      before: z.string().nullable(),
      dist: z.number(),
      modhash: z.string(),
      children: z.array(z.object({
        kind: z.literal("t3"),
        data: z.object({
          id: z.string(),
          name: z.string(),
          title: z.string(),
          subreddit: z.string(),
          selftext: z.string(),
          url: z.string(),
          author: z.string(),
          score: z.number(),
          ups: z.number(),
          downs: z.number(),
          created_utc: z.number(),
          permalink: z.string(),
          num_comments: z.number(),
          is_self: z.boolean(),
        }),
      })),
      error: z.number().optional(),
      message: z.string().optional(),
    }),
  }),
})(async (req, ctx) => {
  // Get query parameters with defaults
  const limit = Number(req.query.limit) || 25
  const count = Number(req.query.count) || 0
  
  // Get all posts from database first
  let filteredPosts = ctx.db.getPosts()
  
  // Apply filters
  if (req.query.id) {
    const ids = req.query.id.split(',')
    filteredPosts = filteredPosts.filter((post: Post) => ids.includes(post.id))
  }
  if (req.query.sr_name) {
    filteredPosts = filteredPosts.filter((post: Post) => post.subreddit === req.query.sr_name)
  }
  
  // Handle pagination
  let startIndex = count
  if (req.query.after) {
    startIndex = filteredPosts.findIndex((p: Post) => p.name === req.query.after) + 1
  } else if (req.query.before) {
    startIndex = Math.max(0, filteredPosts.findIndex((p: Post) => p.name === req.query.before) - limit)
  }
  
  // Get the page of posts
  const pagePosts = filteredPosts.slice(startIndex, startIndex + limit)
  
  // Format response
  try {
    return ctx.json({
      kind: "Listing",
      data: {
        after: pagePosts.length === limit ? pagePosts[pagePosts.length - 1].name : null,
        before: startIndex > 0 ? filteredPosts[startIndex - 1].name : null,
        dist: pagePosts.length,
        modhash: "",  // Reddit API always includes this
        children: pagePosts.map((post: Post) => ({
          kind: "t3",
          data: {
            id: post.id.split('_')[1],
            name: post.id,
            title: post.title,
            subreddit: post.subreddit,
            selftext: post.text,
            url: post.url || `https://fake-reddit.com/r/${post.subreddit}/comments/${post.id}`,
            author: post.author,
            score: post.score,
            ups: post.ups,
            downs: post.downs,
            created_utc: post.created_utc,
            permalink: `/r/${post.subreddit}/comments/${post.id.split('_')[1]}`,
            num_comments: 0,  // Required by Reddit API
            is_self: !post.url,  // Required by Reddit API
          },
        })),
      },
    })
  } catch (error) {
    // Match Reddit's error format
    return ctx.json({
      kind: "Listing",
      data: {
        after: null,
        before: null,
        dist: 0,
        modhash: "",
        children: [],
        error: 400,
        message: error instanceof Error ? error.message : "Unknown error"
      }
    })
  }
})
