import { withRouteSpec } from "../../lib/middleware/with-winter-spec"
import { z } from "zod"
import type { Middleware } from "winterspec"
import type { DbClient } from "../../lib/db/db-client"

export default withRouteSpec({
  methods: ["POST"],
  jsonBody: z.object({
    title: z.string(),
    body: z.string().optional(),
    url: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    post_id: z.string().optional(),
  }),
})(async (req, ctx) => {
  const { title, body, url } = await req.json()
  const currentId = ctx.db.idCounter.toString()
  
  ctx.db.addPost({
    title,
    body,
    url,
  })

  return ctx.json({ ok: true, post_id: currentId })
})
