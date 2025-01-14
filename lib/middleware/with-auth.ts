import type { Middleware, WinterSpecRequest } from "winterspec"
import type { WinterContext } from "../types"

export interface AuthContext {
  user?: {
    name: string
    created: number
    created_utc: number
    has_verified_email: boolean
    is_gold: boolean
    is_mod: boolean
    link_karma: number
    comment_karma: number
    modhash: string
    cookie: string
  }
}

export const withAuth: Middleware<WinterContext, AuthContext> = async (req, ctx, next) => {
  const typedCtx = ctx as WinterContext & Partial<AuthContext>
  const auth = req.headers.get("authorization")
  
  if (auth?.startsWith("Bearer ")) {
    typedCtx.user = {
      name: "fake_user",
      created: 1619827200,
      created_utc: 1619827200,
      has_verified_email: true,
      is_gold: false,
      is_mod: false,
      link_karma: 1,
      comment_karma: 0,
      modhash: "fake_modhash",
      cookie: "reddit_session=fake_session",
    }
  }

  return next(req, typedCtx)
}
