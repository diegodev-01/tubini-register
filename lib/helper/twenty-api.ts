import { NextRequest, NextResponse } from "next/server";

const TWENTY_URL =
  process.env.NEXT_PUBLIC_TWENTY_API_URL || "https://twenty.tubini.com.bo";

export async function fetchWithServerRefresh(
  request: NextRequest,
  endpoint: string,
  options: RequestInit,
) {
  const cookieHeader = request.headers.get("cookie") || "";

  let accessToken = "";
  let refreshToken = "";

  cookieHeader.split("; ").forEach((cookie) => {
    const [name, value] = cookie.split("=");
    if (name === "tubini-token") accessToken = decodeURIComponent(value);
    if (name === "tubini-refresh-token")
      refreshToken = decodeURIComponent(value);
  });

  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(`${TWENTY_URL.replace(/\/$/, "")}${endpoint}`, {
    ...options,
    headers,
  });

  let newTokens: any = null;

  if (response.status === 401 && refreshToken) {
    try {
      const origin = request.headers.get("origin") || TWENTY_URL;

      const refreshResponse = await fetch(
        `${TWENTY_URL.replace(/\/$/, "")}/metadata`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
            mutation RefreshTokens($refreshToken: String!, $origin: String!) {
              refreshTokens(refreshToken: $refreshToken, origin: $origin) {
                tokens {
                  accessOrWorkspaceAgnosticToken { token expiresAt }
                  refreshToken { token expiresAt }
                }
              }
            }
          `,
            variables: { refreshToken, origin },
          }),
        },
      );

      const refreshData = await refreshResponse.json();
      newTokens = refreshData?.data?.refreshTokens?.tokens;

      if (newTokens) {
        headers.set(
          "Authorization",
          `Bearer ${newTokens.accessOrWorkspaceAgnosticToken.token}`,
        );

        response = await fetch(`${TWENTY_URL.replace(/\/$/, "")}${endpoint}`, {
          ...options,
          headers,
        });
      }
    } catch (refreshError) {
      console.error(
        "Error crítico al refrescar el token en el servidor:",
        refreshError,
      );
    }
  }

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error || "Error en la petición a Twenty" },
      { status: response.status },
    );
  }

  const safeData = JSON.parse(JSON.stringify(data));
  const finalResponse = NextResponse.json(safeData);

  if (newTokens) {
    finalResponse.cookies.set(
      "tubini-token",
      newTokens.accessOrWorkspaceAgnosticToken.token,
      {
        expires: new Date(newTokens.accessOrWorkspaceAgnosticToken.expiresAt),
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    );

    finalResponse.cookies.set(
      "tubini-refresh-token",
      newTokens.refreshToken.token,
      {
        expires: new Date(newTokens.refreshToken.expiresAt),
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    );
  }

  return finalResponse;
}
