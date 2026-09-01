"use client";

import { useFormContext } from "react-hook-form";
import { InputHTMLAttributes } from "react";

interface InputComponentProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  type?: string;
}

export const InputComponent = ({
  label,
  type = "text",
  name,
  className = "",
  ...props
}: InputComponentProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-foreground text-sm font-medium">
        {label}
      </label>

      <input
        id={name}
        type={type}
        {...register(name)}
        {...props}
        className={`border-line text-foreground placeholder:text-muted min-h-[2.8rem] w-full rounded-lg border px-3.5 text-sm transition-all duration-150 outline-none focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:focus:border-purple-500 dark:focus:ring-purple-400/30 
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : ""
          } ${className}`}
      />

      {error && (
        <span className="text-xs font-medium text-red-500">{error}</span>
      )}
    </div>
  );
};
