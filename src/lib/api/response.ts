import { NextRequest, NextResponse } from "next/server";

export type ApiContext = {
  requestId: string;
  route: string;
};

export function createApiContext(req: NextRequest, route: string): ApiContext {
  const forwardedId = req.headers.get("x-request-id")?.trim();
  return {
    requestId: forwardedId || crypto.randomUUID(),
    route,
  };
}

export function apiSuccess<T>(ctx: ApiContext, data: T, status = 200, headers?: HeadersInit) {
  const response = NextResponse.json(data, { status, headers });
  response.headers.set("x-request-id", ctx.requestId);
  return response;
}

export function apiError(
  ctx: ApiContext,
  message: string,
  status = 500,
  headers?: HeadersInit,
  details?: unknown
) {
  const response = NextResponse.json(
    {
      error: message,
      requestId: ctx.requestId,
      ...(details ? { details } : {}),
    },
    { status, headers }
  );

  response.headers.set("x-request-id", ctx.requestId);
  return response;
}

export function logApiError(ctx: ApiContext, error: unknown) {
  console.error(`[${ctx.route}] requestId=${ctx.requestId}`, error);
}

export function isValidationLikeError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("invalid") ||
    message.includes("required") ||
    message.includes("must be") ||
    message.includes("cannot") ||
    message.includes("allowed") ||
    message.includes("no fields provided")
  );
}
