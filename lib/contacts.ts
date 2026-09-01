import { parseObservaciones } from "./utils/parse-obs";

export const CONTACT_STATUS_MAP = {
  CLIENTE_DUENO: "Cliente-Dueño",
  CLIENTE_COMPRADOR: "Cliente-Comprador",
  PENDIENTE: "Pendiente",
  DESCARTADO: "Descartado",
  POR_LLAMAR: "Por Llamar",
} as const;

export type TwentyContactStatus = keyof typeof CONTACT_STATUS_MAP;

export const CONTACT_STATUSES = Object.values(CONTACT_STATUS_MAP);
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: ContactStatus;
  observaciones: string;
};

export type ContactInput = Omit<Contact, "id">;

export function isContactStatus(value: unknown): value is ContactStatus {
  return (
    typeof value === "string" &&
    (CONTACT_STATUSES as readonly string[]).includes(value)
  );
}

export function toTwentyStatus(status: ContactStatus): TwentyContactStatus {
  const entry = Object.entries(CONTACT_STATUS_MAP).find(
    ([_, value]) => value === status,
  );
  return (entry ? entry[0] : "PENDIENTE") as TwentyContactStatus;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getStatus(person: Record<string, unknown>): ContactStatus {
  const rawStatus = person.estadoDelContacto;

  if (typeof rawStatus === "string" && rawStatus in CONTACT_STATUS_MAP) {
    return CONTACT_STATUS_MAP[rawStatus as TwentyContactStatus];
  }

  if (isContactStatus(rawStatus)) {
    return rawStatus;
  }

  return "Pendiente";
}

export function normalizeContact(person: Record<string, unknown>): Contact {
  const name =
    person.name && typeof person.name === "object"
      ? (person.name as Record<string, unknown>)
      : {};
  const phones =
    person.phones && typeof person.phones === "object"
      ? (person.phones as Record<string, unknown>)
      : {};

  return {
    id: stringValue(person.id),
    firstName: stringValue(person.firstName ?? name.firstName),
    lastName: stringValue(person.lastName ?? name.lastName),
    phone: stringValue(
      person.phone ?? phones.primaryPhoneNumber ?? phones.primaryPhone,
    ),
    status: getStatus(person),
    observaciones: parseObservaciones(person.observaciones),
  };
}

export function matchesContact(contact: Contact, search: string): boolean {
  const normalizedSearch = search.trim().toLocaleLowerCase();
  if (!normalizedSearch) return true;

  return [contact.firstName, contact.lastName, contact.phone]
    .join(" ")
    .toLocaleLowerCase()
    .includes(normalizedSearch);
}
