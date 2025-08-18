import { route, type Route } from "jsr:@std/http/unstable-route";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com";

/**
 * Gemini API 요청을 프록시하는 핸들러입니다.
 */
async function geminiProxyHandler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  // URLPattern에서 매치된 부분을 제외하고, 실제 API 경로를 구성합니다.
  const targetUrl = `${GEMINI_API_BASE}${url.pathname}${url.search}`;

  const headers = new Headers(req.headers);
  headers.set("User-Agent", "Gemini-Aggregator-Serverless/1.0");

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.body,
    });

    // fetch 응답을 그대로 클라이언트에게 반환합니다.
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: "Forwarding failed", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// URL 패턴에 따라 요청을 처리할 라우트 목록을 정의합니다.
const routes: Route[] = [
  {
    pattern: new URLPattern({ pathname: "/health" }),
    handler: () => new Response("OK", { status: 200 }),
  },
  {
    // /v1beta/ 로 시작하는 모든 경로를 처리합니다.
    pattern: new URLPattern({ pathname: "/v1beta/*" }),
    handler: geminiProxyHandler,
  },
];

/**
 * 위 `routes`에서 일치하는 패턴이 없을 경우 사용될 기본 핸들러입니다.
 */
function defaultHandler(_req: Request): Response {
  return new Response("Not Found", { status: 404 });
}

// 8000번 포트에서 HTTP 서버를 시작합니다.
// Deno.serve는 들어오는 요청을 route 함수에 전달하고,
// route 함수는 정의된 routes를 기반으로 적절한 핸들러를 찾아 실행합니다.
Deno.serve({ port: 8000 }, route(routes, defaultHandler));