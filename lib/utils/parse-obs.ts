export function parseObservaciones(rawObservaciones: unknown): string {
  if (!rawObservaciones) return "";

  // 1. Si viene directamente como string
  if (typeof rawObservaciones === "string") {
    return rawObservaciones.trim();
  }

  // 2. Si viene como objeto con propiedad markdown (estrucutra de Twenty BlockNote)
  if (typeof rawObservaciones === "object" && rawObservaciones !== null) {
    const obsObj = rawObservaciones as Record<string, unknown>;

    if (typeof obsObj.markdown === "string") {
      return obsObj.markdown.trim();
    }

    // Fallback: Si solo viene blocknote como string JSON
    if (typeof obsObj.blocknote === "string") {
      try {
        const blocks = JSON.parse(obsObj.blocknote);
        if (Array.isArray(blocks)) {
          return blocks
            .map((block) =>
              Array.isArray(block.content)
                ? block.content.map((c: { text?: string }) => c.text ?? "").join("")
                : ""
            )
            .filter(Boolean)
            .join("\n")
            .trim();
        }
      } catch {
        return "";
      }
    }
  }

  return "";
}