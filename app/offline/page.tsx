export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <p className="text-accent mb-3 text-sm font-bold tracking-widest uppercase">
          Tubini Register
        </p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Sin conexión
        </h1>
        <p className="text-muted mt-3">
          Conéctate a internet para continuar usando el registro de contactos.
        </p>
      </div>
    </main>
  );
}