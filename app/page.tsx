"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CONTACT_STATUSES, type ContactStatus } from "@/lib/contacts";

export default function Home() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    estado: "Pendiente" as ContactStatus,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "No se pudo guardar el contacto");
      setMessage("Contacto registrado correctamente");
      setForm({ firstName: "", lastName: "", phone: "", estado: "Pendiente" });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Ocurrió un error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="shell flex flex-1 items-center px-5 py-10 sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <section className="space-y-6">
          <div className="eyebrow">TUBINI</div>
          <h1 className="display-title">
            Tubini contactos
          </h1>
          <p className="max-w-md text-lg leading-8 text-(--muted)">
            Centraliza tus contactos y mantenlos listos para la próxima
            conversación.
          </p>
          <Link className="text-link" href="/dashboard">
            Ver contactos registrados
          </Link>
        </section>
        <section className="panel p-6 sm:p-9">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="section-kicker">Nuevo registro</p>
              <h2 className="mt-2 text-2xl font-semibold">Añadir contacto</h2>
            </div>
            <span className="status-dot" aria-hidden="true" />
          </div>
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label>
              Nombre
              <input
                required
                value={form.firstName}
                onChange={(event) =>
                  setForm({ ...form, firstName: event.target.value })
                }
              />
            </label>
            <label>
              Apellido
              <input
                value={form.lastName}
                onChange={(event) =>
                  setForm({ ...form, lastName: event.target.value })
                }
              />
            </label>
            <label>
              Teléfono
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </label>
            <label>
              Estado
              <select
                value={form.estado}
                onChange={(event) =>
                  setForm({
                    ...form,
                    estado: event.target.value as ContactStatus,
                  })
                }
              >
                {CONTACT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="primary-button sm:col-span-2"
              disabled={saving}
              type="submit"
            >
              {saving ? "Guardando..." : "Registrar contacto"}
            </button>
          </form>
          {message && <p className="feedback success">{message}</p>}
          {error && <p className="feedback error">{error}</p>}
        </section>
      </div>
    </main>
  );
}
