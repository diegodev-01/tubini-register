export default async function fetchContacts() {
  try {
    const response = await fetch("/api/customers");
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || "No se pudieron cargar los contactos");
    return result.data;
  } catch (loadError) {
    throw new Error(
      loadError instanceof Error ? loadError.message : "Ocurrió un error",
    );
  }
}
