interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  title?: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  title,
  children,
  isLoading = false,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className="border-line bg-background text-foreground relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          type="button"
          disabled={isLoading}
          className="text-muted hover:text-foreground hover:bg-line/20 absolute top-4 right-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-lg transition-colors disabled:opacity-50"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        {title && (
          <h2 className="text-foreground mb-4 pr-8 text-lg font-semibold tracking-tight">
            {title}
          </h2>
        )}

        <div className="mb-6">{children}</div>

        {onConfirm && (
          <div className="border-line flex items-center justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-foreground hover:bg-line/20 h-10 cursor-pointer rounded-lg px-4 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-accent hover:bg-accent-dark h-10 cursor-pointer rounded-lg px-4 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {isLoading ? "Procesando..." : confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
