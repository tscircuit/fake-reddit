import type { DbClient } from "lib/db/db-client"
import { createDatabase } from "lib/db/db-client"
import type { Middleware } from "winterspec"
import type { WinterContext } from "../types"
import type { AuthContext } from "./with-auth"

export const withDb: Middleware<WinterContext & Partial<AuthContext>, { db: DbClient }> = async (req, ctx, next) => {
  const typedCtx = ctx as WinterContext & Partial<AuthContext> & { db?: DbClient }
  if (!typedCtx.db) {
    typedCtx.db = createDatabase()
  }
  return next(req, typedCtx)
}
