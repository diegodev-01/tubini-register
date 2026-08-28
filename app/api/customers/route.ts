import { NextResponse } from "next/server";
import {
  isContactStatus,
  matchesContact,
  normalizeContact,
  type Contact,
  type ContactStatus,
} from "@/lib/contacts";

function twentyConfig() {
  const apiUrl = process.env.TWENTY_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.TWENTY_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error("Faltan TWENTY_API_URL o TWENTY_API_KEY");
  }

  return { apiUrl, apiKey };
}

function twentyHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, estado = "Pendiente" } = body;

    if (typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "El teléfono es obligatorio" },
        { status: 400 },
      );
    }

    if (!isContactStatus(estado)) {
      return NextResponse.json(
        { error: "El estado seleccionado no es válido" },
        { status: 400 },
      );
    }

    const { apiUrl, apiKey } = twentyConfig();

    const twentyResponse = await fetch(`${apiUrl}/people`, {
      method: "POST",
      headers: twentyHeaders(apiKey),
      body: JSON.stringify({
        name: {
          firstName: typeof firstName === "string" ? firstName.trim() : "",
          lastName: typeof lastName === "string" ? lastName.trim() : "",
        },
        phones: {
          primaryPhoneNumber: phone.trim(),
        },
        customFields: { estado },
      }),
    });

    if (!twentyResponse.ok) {
      const errorData = await twentyResponse.text();
      return NextResponse.json(
        { error: "Error al registrar en Twenty", details: errorData },
        { status: twentyResponse.status },
      );
    }

    const data = normalizeContact(await twentyResponse.json());
    return NextResponse.json({ success: true, data }, { status: 201 });
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

export async function GET(request: Request) {
  try {
    const { apiUrl, apiKey } = twentyConfig();
    const params = new URL(request.url).searchParams;
    const search = params.get("search") ?? "";
    const estado = params.get("estado");

    if (estado && !isContactStatus(estado)) {
      return NextResponse.json(
        { error: "El estado seleccionado no es válido" },
        { status: 400 },
      );
    }

    const twentyResponse = await fetch(`${apiUrl}/people`, {
      method: "GET",
      headers: twentyHeaders(apiKey),
      cache: "no-store",
    });

    if (!twentyResponse.ok) {
      const errorData = await twentyResponse.text();
      return NextResponse.json(
        {
          error: "Error al obtener los clientes de Twenty",
          details: errorData,
        },
        { status: twentyResponse.status },
      );
    }

    const responseData = await twentyResponse.json();
    const people = Array.isArray(responseData)
      ? responseData
      : Array.isArray(responseData.people)
        ? responseData.people
        : Array.isArray(responseData.data)
          ? responseData.data
          : [];
    const data: Contact[] = people
      .map((person: Record<string, unknown>) => normalizeContact(person))
      .filter((contact: Contact) => matchesContact(contact, search))
      .filter(
        (contact: Contact) => !estado || contact.status === (estado as ContactStatus),
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
