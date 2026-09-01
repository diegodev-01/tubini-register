import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isContactStatus,
  matchesContact,
  normalizeContact,
  type Contact,
  type ContactStatus,
} from "@/lib/contacts";

async function twentyConfig(requireUserToken = true) {
  const apiUrl = process.env.NEXT_PUBLIC_TWENTY_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.TWENTY_API_KEY;

  if (!apiUrl) {
    throw new Error("Falta la variable NEXT_PUBLIC_TWENTY_API_URL");
  }

  const cookieStore = await cookies();
  const userToken = cookieStore.get("tubini-token")?.value;

  if (requireUserToken && !userToken) {
    return { apiUrl, token: null, isAuth: false };
  }

  const token = userToken || apiKey;

  if (!token) {
    return { apiUrl, token: null, isAuth: false };
  }

  return { apiUrl, token, isAuth: true };
}

function twentyHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}


async function twentyGraphQL(
  query: string,
  variables: Record<string, unknown>,
  userToken: string,
) {
  const apiUrl = process.env.NEXT_PUBLIC_TWENTY_API_URL?.replace(/\/$/, "");

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`, // Se envía la identidad del usuario logueado
    },
    body: JSON.stringify({ query, variables }),
  });

  return response;
}

export async function POST(request: Request) {
  try {
    // 1. Validar la cookie del usuario logueado
    const cookieStore = await cookies();
    const userToken = cookieStore.get("tubini-token")?.value;

    if (!userToken) {
      return NextResponse.json(
        { error: "No autorizado. Inicie sesión nuevamente." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, estado = "PENDIENTE" } = body;

    const createPersonMutation = `
      mutation CreateOnePerson($data: PersonCreateInput!) {
        createOnePerson(data: $data) {
          id
          name {
            firstName
            lastName
          }
          createdBy {
            id
            name {
              firstName
              lastName
            }
          }
        }
      }
    `;

    const variables = {
      data: {
        name: { firstName, lastName },
        phones: { primaryPhoneNumber: phone },
        estadoDelContacto: estado,
      },
    };

    const response = await twentyGraphQL(
      createPersonMutation,
      variables,
      userToken,
    );
    const result = await response.json();

    if (result.errors) {
      return NextResponse.json(
        { error: "Error en Twenty", details: result.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: true, data: result.data.createOnePerson },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error en POST /api/customers:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { apiUrl, token, isAuth } = await twentyConfig(true);

    if (!isAuth || !token) {
      return NextResponse.json(
        { error: "No autorizado. Inicie sesión nuevamente." },
        { status: 401 },
      );
    }

    const params = new URL(request.url).searchParams;
    const search = params.get("search") ?? "";
    const estado = params.get("estado");

    if (estado && !isContactStatus(estado)) {
      return NextResponse.json(
        { error: "El estado seleccionado no es válido" },
        { status: 400 },
      );
    }

    const twentyResponse = await fetch(`${apiUrl}/rest/people`, {
      method: "GET",
      headers: twentyHeaders(token),
      cache: "no-store",
    });

    if (!twentyResponse.ok) {
      const errorData = await twentyResponse.text();
      console.error("Twenty Error:", errorData);
      return NextResponse.json(
        {
          error: "Error al obtener los clientes de Twenty",
          details: errorData,
        },
        { status: twentyResponse.status },
      );
    }

    const responseData = await twentyResponse.json();

    const people = Array.isArray(responseData.data?.people)
      ? responseData.data.people
      : Array.isArray(responseData.people)
        ? responseData.people
        : Array.isArray(responseData.data)
          ? responseData.data
          : [];

    const data: Contact[] = people
      .map((person: Record<string, unknown>) => normalizeContact(person))
      .filter((contact: Contact) => matchesContact(contact, search))
      .filter(
        (contact: Contact) =>
          !estado || contact.status === (estado as ContactStatus),
      );

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 },
    );
  }
}
