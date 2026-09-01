"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { CopyButton } from "@/components/ui/copy-button";
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

  // Estado para controlar qué contacto se está editando (null si estamos creando uno nuevo)
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
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

  const handleOpenCreate = () => {
    setEditingContact(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormOpen(true);
  };

  const handleFormSaved = (savedContact: Contact) => {
    if (editingContact) {
      // Actualizar en la lista existente
      setContacts((current) =>
        current.map((c) => (c.id === savedContact.id ? savedContact : c)),
      );
    } else {
      // Agregar nuevo al inicio
      setContacts((current) => [savedContact, ...current]);
    }
    setFormOpen(false);
    setEditingContact(null);
  };

  if (!mounted) {
    return <main className="bg-background min-h-screen px-5 pb-24 sm:px-8" />;
  }

  return (
    <main className="bg-background text-foreground min-h-screen px-5 pb-24 transition-colors duration-180 sm:px-8">
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

      <div className="mx-auto w-full max-w-345 pt-3.5">
        <section className="border-line bg-background grid grid-cols-1 gap-2.5 rounded-xl border p-2.5 sm:grid-cols-[1fr_8rem]">
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
        </section>

        <div className="text-muted flex flex-wrap gap-5 px-1.5 py-4 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Descartados:
            <b className="text-foreground">
              {
                contacts.filter((contact) => contact.status === "Descartado")
                  .length
              }
            </b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Pendientes:
            <b className="text-foreground">
              {
                contacts.filter((contact) => contact.status === "Pendiente")
                  .length
              }
            </b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Clientes:
            <b className="text-foreground">
              {
                contacts.filter(
                  (contact) =>
                    contact.status === "Cliente-Comprador" ||
                    contact.status === "Cliente-Dueño",
                ).length
              }
            </b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            Por llamar:
            <b className="text-foreground">
              {
                contacts.filter((contact) => contact.status === "Por Llamar")
                  .length
              }
            </b>
          </span>
        </div>

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
          <ContactTable contacts={filteredContacts} onEdit={handleOpenEdit} />
        )}
      </div>

      {/* BOTÓN FLOTANTE (+) */}
      <button
        aria-label="Añadir contacto"
        className="fixed right-7 bottom-7 flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-[#924cff] text-2xl text-white shadow-lg shadow-purple-600/50 transition-all hover:-translate-y-0.5 hover:scale-105 hover:bg-[#a367ff]"
        onClick={handleOpenCreate}
      >
        +
      </button>

      {/* MODAL FORMULARIO (Crear / Editar) */}
      {formOpen && (
        <ContactFormModal
          initialContact={editingContact}
          onClose={() => {
            setFormOpen(false);
            setEditingContact(null);
          }}
          onSaved={handleFormSaved}
        />
      )}
    </main>
  );
}

interface ContactTableProps {
  contacts: Contact[];
  onEdit?: (contact: Contact) => void;
}

export function ContactTable({ contacts, onEdit }: ContactTableProps) {
  const STATUS_ORDER: Record<ContactStatus, number> = {
    Pendiente: 1,
    "Por Llamar": 2,
    "Cliente-Dueño": 3,
    "Cliente-Comprador": 4,
    Descartado: 5,
  };

  const sortedContacts = [...contacts].sort((a, b) => {
    const priorityA = STATUS_ORDER[a.status] ?? 99;
    const priorityB = STATUS_ORDER[b.status] ?? 99;
    return priorityA - priorityB;
  });

  return (
    <section className="border-line overflow-hidden rounded-2xl border bg-white/55 dark:bg-[#080811]/86">
      <div className="bg-accent/12 text-accent-dark hidden grid-cols-[minmax(11rem,1.4fr)_minmax(8.5rem,1fr)_0.8fr_minmax(11rem,1.8fr)_auto] items-center gap-4 px-4 py-3 text-[0.73rem] font-bold sm:grid">
        <span>Cliente</span>
        <span>Teléfono</span>
        <span>Estado</span>
        <span>Observaciones</span>
        <span className="text-right">Acciones</span>
      </div>

      {sortedContacts.map((contact) => (
        <article
          className="border-line text-muted grid grid-cols-[1fr_auto] items-center gap-2.5 border-t px-4 py-3.5 text-xs first:border-t-0 sm:grid-cols-[minmax(11rem,1.4fr)_minmax(8.5rem,1fr)_0.8fr_minmax(11rem,1.8fr)_auto] sm:gap-4"
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

          <div className="col-span-1 flex items-center gap-1.5 sm:col-auto">
            <span className="font-mono text-xs">{contact.phone}</span>
            {contact.phone && <CopyButton text={contact.phone} />}
          </div>

          <div className="col-span-1 sm:col-auto">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium ${
                contact.status === "Descartado"
                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                  : contact.status === "Pendiente"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    : contact.status === "Por Llamar"
                      ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                      : contact.status === "Cliente-Dueño"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : contact.status === "Cliente-Comprador"
                          ? "bg-teal-500/15 text-teal-700 dark:text-teal-400"
                          : "bg-gray-500/15 text-gray-700"
              }`}
            >
              {contact.status}
            </span>
          </div>

          <p
            className="text-muted col-span-2 line-clamp-3 wrap-break-word text-[0.73rem] sm:col-auto"
            title={contact.observaciones || undefined}
          >
            {contact.observaciones || "Sin observaciones"}
          </p>

          <div className="col-span-2 flex items-center justify-end sm:col-auto">
            <button
              onClick={() => onEdit?.(contact)}
              type="button"
              className="text-muted hover:text-foreground hover:bg-accent/20 border-line flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[0.7rem] font-medium transition-colors"
              title="Editar contacto"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              <span>Editar</span>
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

function ContactFormModal({
  initialContact,
  onClose,
  onSaved,
}: {
  initialContact?: Contact | null;
  onClose: () => void;
  onSaved: (contact: Contact) => void;
}) {
  const isEditing = Boolean(initialContact);

  const [form, setForm] = useState({
    firstName: initialContact?.firstName || "",
    lastName: initialContact?.lastName || "",
    phone: initialContact?.phone || "",
    estado: initialContact?.status || ("Por Llamar" as ContactStatus),
    observaciones: initialContact?.observaciones || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/twenty/people/${initialContact?.id}`
        : `/api/twenty/people`;
      const method = isEditing ? "PATCH" : "POST";

      const estadoEnum = form.estado
        .toUpperCase()
        .replace(/\s+/g, "_")
        .replace(/-/g, "_");

      const payload: Record<string, any> = {
        name: {
          firstName: form.firstName,
          lastName: form.lastName,
        },
        phones: {
          primaryPhoneNumber: form.phone,
          primaryPhoneCountryCode: "BO",
          primaryPhoneCallingCode: "+591",
        },
        estadoDelContacto: estadoEnum,
        observaciones: {
          markdown: form.observaciones ? `${form.observaciones}\n` : "",
          blocknote: JSON.stringify([
            {
              id: crypto.randomUUID(),
              type: "paragraph",
              props: {
                backgroundColor: "default",
                textColor: "default",
                textAlignment: "left",
              },
              content: form.observaciones
                ? [{ type: "text", text: form.observaciones, styles: {} }]
                : [],
              children: [],
            },
          ]),
        },
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "No se pudo guardar el contacto");

      const savedPerson = result.data || result;
      const formattedContact: Contact = {
        id: savedPerson.id,
        firstName: savedPerson.name?.firstName || form.firstName,
        lastName: savedPerson.name?.lastName || form.lastName,
        phone: savedPerson.phones?.primaryPhoneNumber || form.phone,
        status: form.estado,
        observaciones:
          savedPerson.observaciones?.markdown || form.observaciones,
      };

      onSaved(formattedContact);
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
              {isEditing ? "Editar registro" : "Nuevo registro"}
            </div>
            <h2 id="form-title" className="text-2xl font-bold">
              {isEditing ? "Editar contacto" : "Añadir contacto"}
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

          <label className="text-muted grid gap-2 text-xs font-semibold">
            Observaciones
            <textarea
              rows={3}
              value={form.observaciones}
              onChange={(event) =>
                setForm({ ...form, observaciones: event.target.value })
              }
              className="border-line text-foreground focus:border-accent w-full rounded-lg border bg-white/70 p-3 outline-none focus:ring-2 focus:ring-amber-500/15 dark:bg-[#11111d]"
            />
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
            {saving
              ? "Guardando..."
              : isEditing
                ? "Actualizar contacto"
                : "Registrar contacto"}
          </button>
        </form>
      </section>
    </div>
  );
}
