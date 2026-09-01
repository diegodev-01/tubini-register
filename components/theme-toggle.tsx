"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!isMounted) {
    return (
      <button
        className="border-line text-muted flex h-9 w-9 items-center justify-center rounded-lg border bg-foreground/20 dark:bg-foreground/20"
        aria-label="Cargando tema"
      />
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="border-line text-muted  hover:text-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border bg-foreground/20 transition-colors"
      aria-label="Cambiar tema"
    >
      {resolvedTheme === "dark" ? "☼" : "☾"}
    </button>
  );
}
