import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "El teléfono es obligatorio" },
        { status: 400 },
      );
    }

    const twentyResponse = await fetch(`${process.env.TWENTY_API_URL}/people`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
      },
      body: JSON.stringify({
        name: {
          firstName: firstName || "",
          lastName: lastName || "",
        },
        phones: {
          primaryPhoneNumber: phone,
        },
      }),
    });

    if (!twentyResponse.ok) {
      const errorData = await twentyResponse.json();
      return NextResponse.json(
        { error: "Error al registrar en Twenty", details: errorData },
        { status: twentyResponse.status },
      );
    }

    const data = await twentyResponse.json();
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const twentyResponse = await fetch(`${process.env.TWENTY_API_URL}/people`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
      },
    });

    if (!twentyResponse.ok) {
      const errorData = await twentyResponse.json();
      return NextResponse.json(
        {
          error: "Error al obtener los clientes de Twenty",
          details: errorData,
        },
        { status: twentyResponse.status },
      );
    }

    const data = await twentyResponse.json();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
