import type { z } from "zod"

export interface WinterRequest {
  headers: Headers
  query: Record<string, string>
  body: any
  json(): Promise<any>
}

export interface WinterContext {
  json(data: any): Response
  db: any
}

export type Middleware<ReqExt = {}, CtxExt = {}> = (
  req: WinterRequest & ReqExt,
  ctx: WinterContext & CtxExt,
  next: (req: WinterRequest & ReqExt, ctx: WinterContext & CtxExt) => Promise<Response>
) => Promise<Response>
