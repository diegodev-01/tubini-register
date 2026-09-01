"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Modal } from "@/components/ui/Modal";
import {
  CONTACT_STATUSES,
  type Contact,
  type ContactStatus,
} from "@/lib/contacts";
import { useModal } from "@/lib/hooks/useModal";
import fetchContacts from "@/services/auth/contacts/contacts.services";
import { signOut } from "@/services/auth/sign-in";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  estado: "Pendiente" as ContactStatus,
};

export default function DashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"Todos" | ContactStatus>("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isOpen, openModal, closeModal } = useModal();
  const router = useRouter();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    fetchContacts()
      .then((contacts) => setContacts(contacts))
      .catch((loadError) => {
        setError(
          loadError instanceof Error ? loadError.message : "Ocurrió un error",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return contacts.filter((contact) => {
      const fullName =
        `${contact.firstName} ${contact.lastName}`.toLocaleLowerCase();
      return (
        (!query || fullName.includes(query) || contact.phone.includes(query)) &&
        (status === "Todos" || contact.status === status)
      );
    });
  }, [contacts, search, status]);

  if (!mounted) {
    return <main className="bg-background min-h-screen px-5 pb-24 sm:px-8" />;
  }

  return (
    <main className="bg-background text-foreground min-h-screen px-5 pb-24 transition-colors duration-180 sm:px-8">
      {/* HEADER */}
      <header className="border-line -mx-5 sm:-mx-8 mb-6 flex min-h-26 items-center justify-between border-b px-5 sm:px-8">
        <div>
          <div className="text-accent-dark text-2xl font-extrabold tracking-tight">
            Tubini Inmuebles
          </div>
          <div className="text-muted mt-1 text-[0.75rem] tracking-widest uppercase">
            DIEGO@DIEGUITO.DEV
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => openModal()}
            className="mr-3 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-500 bg-red-500/10 px-2 py-1.25 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
          >
            <LogOut />
          </button>
          {isOpen && (
            <Modal
              isOpen={isOpen}
              onClose={() => closeModal()}
              onConfirm={() => {
                signOut();
                router.push("/login");
              }}
              confirmText="Sí, cerrar sesión"
              cancelText="No, volver"
              title="Confirmar acción"
            >
              <p className="text-muted text-sm">
                ¿Estás seguro de que deseas cerrar sesion?
              </p>
            </Modal>
          )}
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <div className="mx-auto w-full max-w-345 pt-3.5">
        {/* BARRA DE FILTROS */}
        <section className="border-line bg-background grid grid-cols-1 gap-2.5 rounded-xl border p-2.5 sm:grid-cols-[1fr_8rem_8rem]">
          <input
            aria-label="Buscar contactos"
            placeholder="Buscar..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="border-line text-foreground focus:border-accent min-h-10 w-full rounded-lg border bg-background px-3.5 outline-none focus:ring-2 focus:ring-amber-500/15 dark:border-transparent "
          />
          <select
            aria-label="Filtrar por estado"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "Todos" | ContactStatus)
            }
            className="border-line text-foreground focus:border-accent min-h-10 w-full rounded-lg border bg-background px-3.5 outline-none focus:ring-2 focus:ring-amber-500/15 dark:border-transparent "
          >
            <option value="Todos">Estados</option>
            {CONTACT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por tipo"
            defaultValue="Contacto"
            className="border-line text-foreground focus:border-accent min-h-10 w-full rounded-lg border bg-background/80 px-3.5 outline-none focus:ring-2 focus:ring-amber-500/15 dark:border-transparent"
          >
            <option>Contacto</option>
          </select>
        </section>

        {/* RESUMEN / STATS */}
        <div className="text-muted flex flex-wrap gap-5 px-1.5 py-4 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            Números: <b className="text-foreground">{contacts.length}</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Activos:{" "}
            <b className="text-foreground">
              {
                contacts.filter((contact) => contact.status !== "Descartado")
                  .length
              }
            </b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-purple-500" />
            Visibles:{" "}
            <b className="text-foreground">{filteredContacts.length}</b>
          </span>
        </div>

        {/* ESTADOS CARGANDO / ERROR / VACÍO */}
        {loading && (
          <div className="border-line text-muted grid gap-2 rounded-2xl border p-16 text-center">
            Cargando contactos...
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg bg-red-100 p-4 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && filteredContacts.length === 0 && (
          <div className="border-line text-muted grid gap-2 rounded-2xl border p-16 text-center">
            <strong className="text-foreground text-lg">
              No encontramos contactos
            </strong>
            <span>Prueba otra búsqueda o crea un nuevo registro.</span>
          </div>
        )}

        {/* TABLA DE CONTACTOS */}
        {!loading && !error && filteredContacts.length > 0 && (
          <ContactTable contacts={filteredContacts} />
        )}
      </div>

      {/* BOTÓN FLOTANTE (+) */}
      <button
        aria-label="Añadir contacto"
        className="fixed right-7 bottom-7 flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-[#924cff] text-2xl text-white shadow-lg shadow-purple-600/50 transition-all hover:-translate-y-0.5 hover:scale-105 hover:bg-[#a367ff]"
        onClick={() => setFormOpen(true)}
      >
        +
      </button>

      {/* MODAL FORMULARIO */}
      {formOpen && (
        <ContactForm
          onClose={() => setFormOpen(false)}
          onCreated={(contact) => {
            setContacts((current) => [contact, ...current]);
            setFormOpen(false);
          }}
        />
      )}
    </main>
  );
}

function ContactTable({ contacts }: { contacts: Contact[] }) {
  return (
    <section className="border-line bg-white/55 dark:bg-[#080811]/86 overflow-hidden rounded-2xl border">
      {/* CABECERA (Oculta en móvil) */}
      <div className="bg-accent/12 text-accent-dark hidden grid-cols-[minmax(12rem,1.5fr)_minmax(8rem,1fr)_0.75fr_minmax(8rem,1fr)_0.7fr] items-center gap-4 px-4 py-3 text-[0.73rem] font-bold sm:grid">
        <span>Cliente</span>
        <span>Teléfono</span>
        <span>Tipo</span>
        <span>Estado</span>
        <span>Registro</span>
      </div>

      {/* FILAS */}
      {contacts.map((contact) => (
        <article
          className="border-line text-muted grid grid-cols-[1fr_auto] items-center gap-2.5 border-t px-4 py-3.5 text-xs first:border-t-0 sm:grid-cols-[minmax(12rem,1.5fr)_minmax(8rem,1fr)_0.75fr_minmax(8rem,1fr)_0.7fr] sm:gap-4"
          key={contact.id || `${contact.firstName}-${contact.phone}`}
        >
          <div className="col-span-1">
            <strong className="text-foreground block text-sm font-semibold">
              {contact.firstName} {contact.lastName}
            </strong>
            <small className="text-muted text-[0.68rem]">
              Contacto registrado
            </small>
          </div>

          <span className="col-span-1 sm:col-auto">{contact.phone}</span>

          <span className="border-line w-fit rounded-full border px-2 py-0.5 text-[0.68rem]">
            Contacto
          </span>

          <span
            className={`w-fit rounded-full px-2 py-0.5 text-[0.68rem] font-medium ${
              contact.status === "Descartado"
                ? "bg-white/10 text-muted"
                : "bg-accent/14 text-accent-dark"
            }`}
          >
            {contact.status}
          </span>

          <small className="text-muted col-span-1 text-[0.68rem] sm:col-auto">
            Contacto
          </small>
        </article>
      ))}
    </section>
  );
}

function ContactForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (contact: Contact) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
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
      onCreated(result.data);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Ocurrió un error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-xs"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        aria-labelledby="form-title"
        aria-modal="true"
        className="bg-background border-line text-foreground w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        role="dialog"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-accent-dark text-[0.7rem] font-bold tracking-widest uppercase">
              Nuevo registro
            </div>
            <h2 id="form-title" className="text-2xl font-bold">
              Añadir contacto
            </h2>
          </div>
          <button
            aria-label="Cerrar formulario"
            className="text-muted hover:text-foreground cursor-pointer text-2xl leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="text-muted grid gap-2 text-xs font-semibold">
            Nombre
            <input
              required
              autoFocus
              value={form.firstName}
              onChange={(event) =>
                setForm({ ...form, firstName: event.target.value })
              }
              className="border-line text-foreground focus:border-accent min-h-12 w-full rounded-lg border bg-white/70 px-3.5 outline-none focus:ring-2 focus:ring-amber-500/15 dark:bg-[#11111d]"
            />
          </label>

          <label className="text-muted grid gap-2 text-xs font-semibold">
            Apellido
            <input
              value={form.lastName}
              onChange={(event) =>
                setForm({ ...form, lastName: event.target.value })
              }
              className="border-line text-foreground focus:border-accent min-h-12 w-full rounded-lg border bg-white/70 px-3.5 outline-none focus:ring-2 focus:ring-amber-500/15 dark:bg-[#11111d]"
            />
          </label>

          <label className="text-muted grid gap-2 text-xs font-semibold">
            Teléfono
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
              className="border-line text-foreground focus:border-accent min-h-12 w-full rounded-lg border bg-white/70 px-3.5 outline-none focus:ring-2 focus:ring-amber-500/15 dark:bg-[#11111d]"
            />
          </label>

          <label className="text-muted grid gap-2 text-xs font-semibold">
            Estado
            <select
              value={form.estado}
              onChange={(event) =>
                setForm({
                  ...form,
                  estado: event.target.value as ContactStatus,
                })
              }
              className="border-line text-foreground focus:border-accent min-h-12 w-full rounded-lg border bg-white/70 px-3.5 outline-none focus:ring-2 focus:ring-amber-500/15 dark:bg-[#11111d]"
            >
              {CONTACT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="rounded-lg bg-red-100 p-3 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            className="bg-accent hover:bg-accent-dark mt-2 flex min-h-12 cursor-pointer items-center justify-center rounded-lg font-bold text-white transition-all hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-65"
            disabled={saving}
            type="submit"
          >
            {saving ? "Guardando..." : "Registrar contacto"}
          </button>
        </form>
      </section>
    </div>
  );
}
