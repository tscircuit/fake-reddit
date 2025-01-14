import { withRouteSpec } from "lib/middleware/with-winter-spec"
import { withAuth, type AuthContext } from "lib/middleware/with-auth"
import { z } from "zod"

export default withRouteSpec({
  auth: "auth",
  middleware: [withAuth],
  methods: ["GET"],
  headers: z.object({
    authorization: z.string().optional(),
  }),
  jsonResponse: z.object({
    error: z.number().optional(),
    message: z.string().optional(),
    data: z.object({
      name: z.string(),
      created: z.number(),
      created_utc: z.number(),
      has_verified_email: z.boolean(),
      is_gold: z.boolean(),
      is_mod: z.boolean(),
      link_karma: z.number(),
      comment_karma: z.number(),
      modhash: z.string(),
      cookie: z.string(),
    }).optional(),
  }),
})(async (req, ctx) => {
  if (!ctx.user) {
    return ctx.json({
      error: 401,
      message: "Unauthorized",
    }).status(401)
  }

  return ctx.json({
    data: ctx.user
  })
})
