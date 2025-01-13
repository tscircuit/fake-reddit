import { withRouteSpec } from "../../lib/middleware/with-winter-spec"
import { z } from "zod"
import type { Middleware } from "winterspec"
import type { DbClient } from "../../lib/db/db-client"

export default withRouteSpec({
  methods: ["GET"],
  jsonResponse: z.object({
    posts: z.array(
      z.object({
        post_id: z.string(),
        title: z.string(),
        body: z.string().optional(),
        url: z.string().optional(),
        created_at: z.string(),
      })
    ),
  }),
})((req, ctx) => {
  return ctx.json({
    posts: ctx.db.posts,
  })
})
