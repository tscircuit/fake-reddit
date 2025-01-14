import { createWithWinterSpec } from "winterspec"
import { withDb } from "./with-db"
import { withAuth } from "./with-auth"
export const withRouteSpec = createWithWinterSpec({
  openapi: {
    apiName: "tscircuit Debug API",
    productionServerUrl: "https://debug-api.tscircuit.com"
  },
  beforeAuthMiddleware: [],
  authMiddleware: {
    auth: withAuth
  },
  afterAuthMiddleware: [withDb],
})
