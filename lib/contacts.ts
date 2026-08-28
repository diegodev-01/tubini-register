export const CONTACT_STATUSES = [
  "Cliente-Dueño",
  "Cliente-Comprador",
  "Pendiente",
  "Descartado",
] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: ContactStatus;
};

export type ContactInput = Omit<Contact, "id">;

export function isContactStatus(value: unknown): value is ContactStatus {
  return (
    typeof value === "string" &&
    (CONTACT_STATUSES as readonly string[]).includes(value)
  );
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getStatus(person: Record<string, unknown>): ContactStatus {
  const customFields = person.customFields;
  const customStatus =
    customFields && typeof customFields === "object"
      ? (customFields as Record<string, unknown>).status ??
        (customFields as Record<string, unknown>).estado
      : undefined;
  const candidate = person.status ?? person.estado ?? customStatus;

  return isContactStatus(candidate) ? candidate : "Pendiente";
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
