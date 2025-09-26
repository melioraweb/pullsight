import React from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

interface ToastOptions {
    description?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const showToast = {
    success: (message: string, options?: ToastOptions) => {
        return toast.success(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            icon: <CheckCircle className="h-4 w-4" />,
            action: options?.action,
        });
    },

    error: (message: string, options?: ToastOptions) => {
        return toast.error(message, {
            description: options?.description,
            duration: options?.duration || 5000,
            icon: <XCircle className="h-4 w-4" />,
            action: options?.action,
        });
    },

    warning: (message: string, options?: ToastOptions) => {
        return toast.warning(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            icon: <AlertCircle className="h-4 w-4" />,
            action: options?.action,
        });
    },

    info: (message: string, options?: ToastOptions) => {
        return toast.info(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            icon: <Info className="h-4 w-4" />,
            action: options?.action,
        });
    },

    loading: (message: string, options?: Omit<ToastOptions, "action">) => {
        return toast.loading(message, {
            description: options?.description,
            duration: options?.duration || Infinity,
        });
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        }
    ) => {
        return toast.promise(promise, {
            loading: messages.loading,
            success: (data) =>
                typeof messages.success === "function"
                    ? messages.success(data)
                    : messages.success,
            error: (err) =>
                typeof messages.error === "function"
                    ? messages.error(err)
                    : messages.error,
        });
    },

    dismiss: (toastId?: string | number) => {
        return toast.dismiss(toastId);
    },
};

// Export individual methods for convenience
export const { success, error, warning, info, loading, promise, dismiss } =
    showToast;

// Default export
export default showToast;
