import Cookies from "js-cookie";

interface LoginTokenResponse {
  data?: {
    getLoginTokenFromCredentials?: {
      loginToken?: {
        token: string;
        expiresAt: string;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

interface AuthTokensResponse {
  data?: {
    getAuthTokensFromLoginToken?: {
      tokens?: {
        accessOrWorkspaceAgnosticToken?: {
          token: string;
          expiresAt: string;
        };
        refreshToken?: {
          token: string;
          expiresAt: string;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export const signIn = async (email: string, password: string) => {
  try {
    const TWENTY_URL =
      process.env.NEXT_PUBLIC_TWENTY_API_URL || "https://twenty.tubini.com.bo";
    const origin =
      typeof window !== "undefined" ? window.location.origin : TWENTY_URL;
    const metadataEndpoint = `${TWENTY_URL.replace(/\/$/, "")}/metadata`;

    // 1. Obtener el loginToken inicial mediante GraphQL
    const responseStep1 = await fetch(metadataEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: "GetLoginTokenFromCredentials",
        query: `
          mutation GetLoginTokenFromCredentials($email: String!, $password: String!, $captchaToken: String, $origin: String!) {
            getLoginTokenFromCredentials(
              email: $email
              password: $password
              captchaToken: $captchaToken
              origin: $origin
            ) {
              loginToken {
                ...AuthTokenFragment
                __typename
              }
              __typename
            }
          }

          fragment AuthTokenFragment on AuthToken {
            token
            expiresAt
            __typename
          }
        `,
        variables: { email, password, captchaToken: null, origin },
      }),
    });

    const resultStep1: LoginTokenResponse = await responseStep1.json();

    if (resultStep1.errors && resultStep1.errors.length > 0) {
      throw new Error(resultStep1.errors[0].message);
    }

    const tempLoginToken =
      resultStep1.data?.getLoginTokenFromCredentials?.loginToken?.token;

    if (!tempLoginToken) {
      throw new Error("No se pudo autenticar las credenciales en Twenty.");
    }

    // 2. Canjear el loginToken por los tokens definitivos
    const responseStep2 = await fetch(metadataEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: "getAuthTokensFromLoginToken",
        query: `
          mutation getAuthTokensFromLoginToken($loginToken: String!, $origin: String!) {
            getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
              tokens {
                ...AuthTokenPairFragment
                __typename
              }
              __typename
            }
          }

          fragment AuthTokenFragment on AuthToken {
            token
            expiresAt
            __typename
          }

          fragment AuthTokenPairFragment on AuthTokenPair {
            accessOrWorkspaceAgnosticToken {
              ...AuthTokenFragment
              __typename
            }
            refreshToken {
              ...AuthTokenFragment
              __typename
            }
            __typename
          }
        `,
        variables: { loginToken: tempLoginToken, origin },
      }),
    });

    const resultStep2: AuthTokensResponse = await responseStep2.json();

    if (resultStep2.errors && resultStep2.errors.length > 0) {
      throw new Error(resultStep2.errors[0].message);
    }

    const tokenPair = resultStep2.data?.getAuthTokensFromLoginToken?.tokens;
    const finalAccessToken = tokenPair?.accessOrWorkspaceAgnosticToken?.token;
    const finalRefreshToken = tokenPair?.refreshToken?.token;

    if (!finalAccessToken) {
      throw new Error("No se pudieron obtener los tokens de sesión finales.");
    }

    // 3. Guardar el access token (expira en 30 mins -> aprox 1/48 de día o se maneja por cookie de sesión)
    Cookies.set("tubini-token", finalAccessToken, {
      expires: 1 / 48, // 30 minutos
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // 4. Guardar el refresh token (expira en 5 días)
    if (finalRefreshToken) {
      Cookies.set("tubini-refresh-token", finalRefreshToken, {
        expires: 5, // 5 días
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return { email };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error de autenticación";
    console.error("Error en signIn:", errorMessage);
    throw new Error(`Error signing in: ${errorMessage}`);
  }
};

export const signOut = async () => {
  try {
    Cookies.remove("tubini-token", { path: "/" });
    Cookies.remove("tubini-refresh-token", { path: "/" });
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
