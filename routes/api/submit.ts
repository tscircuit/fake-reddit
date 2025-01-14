import { withRouteSpec } from "lib/middleware/with-winter-spec"
import type { WinterRequest, WinterContext } from "lib/types"
import { z } from "zod"
import type { Post } from "lib/db/schema"
import { submitSchema } from "lib/schemas/submit"

export default withRouteSpec({
  methods: ["POST"],
  jsonBody: submitSchema,
  jsonResponse: z.object({
    json: z.object({
      errors: z.array(z.array(z.string())).default([]),
      data: z.object({
        url: z.string(),
        id: z.string(),
        name: z.string(),
      }),
    }),
  }),
})(async (req, ctx) => {
  try {
    const body = await req.json() as z.infer<typeof submitSchema>
    const subreddit = body.sr || body.subreddit
    if (!subreddit) {
      return ctx.json({
        json: {
          errors: [["subreddit", "Please enter a subreddit"]],
          data: {
            url: "",
            id: "",
            name: ""
          }
        }
      })
    }
    const { title, text, url, kind } = body

    // Generate a unique ID for the post
    const postId = `t3_${ctx.db.idCounter + 1}`
    
    // Validate star count for snippets
    if (body.star_count !== undefined && body.star_count < 2) {
      return ctx.json({
        json: {
          errors: [["star_count", "Snippet must have at least 2 stars"]],
          data: {
            url: "",
            id: "",
            name: ""
          }
        }
      })
    }

    // Create the post object
    const post = {
      id: postId,
      name: postId,
      subreddit,
      title,
      kind,
      url: url || "",
      created_utc: body.created_at ? new Date(body.created_at).getTime() / 1000 : Date.now() / 1000,
      author: body.owner_name || "fake_user",
      score: body.star_count || 1,
      ups: body.star_count || 1,
      downs: 0,
      text: body.code ? JSON.stringify({
        code: body.code,
        description: body.description,
        snippet_type: body.snippet_type,
        star_count: body.star_count,
        created_at: body.created_at,
        updated_at: body.updated_at
      }) : (text || "")
    }

    // Store the post in the database using the client methods
    ctx.db.addPost(post)

    // Return response in Reddit's format
    return ctx.json({
      json: {
        errors: [],
        data: {
          url: `/r/${subreddit}/comments/${postId.split('_')[1]}`,
          id: postId.split('_')[1],
          name: postId,
        },
      },
    })
  } catch (error) {
    return ctx.json({
      json: {
        errors: [["error", error instanceof Error ? error.message : "Unknown error"]],
        data: {
          url: "",
          id: "",
          name: ""
        }
      }
    })
  }
})
