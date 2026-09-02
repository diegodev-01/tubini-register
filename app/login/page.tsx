"use client";

import { useForm, FormProvider } from "react-hook-form";
import { InputComponent } from "@/components/form/input-component";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginData, LoginSchema } from "./schema/login.schema";
import { ThemeToggle } from "@/components/theme-toggle";
import { signIn } from "@/services/auth/sign-in";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const methods = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginData) => {
    try {
      await signIn(data.email, data.password);

      router.refresh();

      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error al iniciar sesión";
      const message =
        errorMessage.toLowerCase().includes("credentials") ||
        errorMessage.toLowerCase().includes("wrong")
          ? "Correo o contraseña incorrectos"
          : errorMessage;

      methods.setError("root", {
        type: "manual",
        message,
      });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <header className="absolute top-0 right-0 p-4">
        <ThemeToggle />
      </header>

      <div className="border-line bg-background shadow-black/5 dark:shadow-black/40 w-full max-w-sm rounded-2xl border p-6 shadow-2xl backdrop-blur-xl">
        <h1 className="text-foreground mb-6 text-2xl font-bold tracking-tight">
          Iniciar sesión
        </h1>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <InputComponent name="email" label="Correo" type="email" />
            <InputComponent
              name="password"
              label="Contraseña"
              type="password"
            />
            {methods.formState.errors.root && (
              <div className="text-red-500 text-xs">
                {methods.formState.errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={methods.formState.isSubmitting}
              className="bg-accent hover:bg-accent-dark mt-2 min-h-[2.8rem] w-full cursor-pointer rounded-lg font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {methods.formState.isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
