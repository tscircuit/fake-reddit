import type { z } from "zod"
import type { WinterSpecRequest, WinterSpecRouteParams, SerializableToResponse, WinterSpecResponse, WinterSpecJsonResponse } from "winterspec"

export type { WinterSpecRequest as WinterRequest, SerializableToResponse as WinterResponse } from "winterspec"

export interface WinterContext {
  json<T>(data: T): WinterSpecJsonResponse<T>
  db?: any
}

export type { Middleware } from "winterspec"
