"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CONTACT_STATUSES, type Contact, type ContactStatus } from "@/lib/contacts";

export default function DashboardPage() {
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<"Todos" | ContactStatus>("Todos");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		fetch("/api/customers")
			.then(async (response) => {
				const result = await response.json();
				if (!response.ok) throw new Error(result.error || "No se pudieron cargar los contactos");
				setContacts(result.data);
			})
			.catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Ocurrió un error"))
			.finally(() => setLoading(false));
	}, []);

	const filteredContacts = useMemo(() => {
		const query = search.trim().toLocaleLowerCase();
		return contacts.filter((contact) => {
			const fullName = `${contact.firstName} ${contact.lastName}`.toLocaleLowerCase();
			return (!query || fullName.includes(query) || contact.phone.includes(query)) && (status === "Todos" || contact.status === status);
		});
	}, [contacts, search, status]);

	return <main className="shell min-h-screen px-5 py-8 sm:px-8"><div className="mx-auto w-full max-w-6xl"><header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><Link className="eyebrow" href="/">TUBINI / CONTACTOS</Link><h1 className="display-title mt-3">Tu agenda, en orden.</h1></div><Link className="primary-button inline-flex" href="/">+ Nuevo contacto</Link></header><section className="toolbar panel mb-6 p-3 sm:p-4"><input aria-label="Buscar contactos" className="search-input" placeholder="Buscar por nombre o teléfono..." value={search} onChange={(event) => setSearch(event.target.value)} /><select aria-label="Filtrar por estado" value={status} onChange={(event) => setStatus(event.target.value as "Todos" | ContactStatus)}><option value="Todos">Todos los estados</option>{CONTACT_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select></section><div className="mb-5 flex items-center justify-between text-sm text-(--muted)"><span>{filteredContacts.length} contacto{filteredContacts.length === 1 ? "" : "s"}</span><span>{status === "Todos" ? "Vista general" : status}</span></div>{loading && <div className="panel p-10 text-center text-(--muted)">Cargando contactos...</div>}{error && <div className="feedback error">{error}</div>}{!loading && !error && filteredContacts.length === 0 && <div className="panel p-12 text-center"><h2 className="text-xl font-semibold">No encontramos contactos</h2><p className="mt-2 text-(--muted)">Prueba otra búsqueda o registra el primero.</p></div>}{!loading && !error && filteredContacts.length > 0 && <ContactList contacts={filteredContacts} />}</div></main>;
}

function ContactList({ contacts }: { contacts: Contact[] }) { return <div className="panel overflow-hidden"><div className="hidden grid-cols-[1.3fr_1fr_1fr_1fr] gap-4 border-b border-(--line) px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-(--muted) md:grid"><span>Contacto</span><span>Teléfono</span><span>Estado</span><span>Registro</span></div>{contacts.map((contact) => <article className="grid gap-4 border-b border-(--line) p-5 last:border-0 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:items-center md:px-6" key={contact.id || `${contact.firstName}-${contact.phone}`}><div><h2 className="font-semibold">{contact.firstName} {contact.lastName}</h2><p className="mt-1 text-sm text-(--muted) md:hidden">{contact.phone}</p></div><p className="hidden text-sm text-(--muted) md:block">{contact.phone}</p><span className={`status-pill status-${contact.status === "Descartado" ? "muted" : "active"}`}>{contact.status}</span><p className="text-xs text-(--muted)">Contacto</p></article>)}</div>; }
