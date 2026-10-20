export function getClientIp(
  request: Pick<Request, "headers">,
  isDevelopment = import.meta.env.DEV,
): string | null {
  const clientIp = request.headers.get("cf-connecting-ip");
  if (clientIp?.trim()) return clientIp;
  return isDevelopment ? "127.0.0.1" : null;
}
