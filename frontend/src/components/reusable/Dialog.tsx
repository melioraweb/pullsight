"use client";

import React from "react";
import {
    Dialog as ShadDialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

interface DialogAction {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
    loading?: boolean;
    disabled?: boolean;
}

interface DialogProps {
    // Trigger
    trigger?: React.ReactNode;

    // Dialog state
    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    // Content
    title?: string;
    description?: string;
    children?: React.ReactNode;

    // Actions
    actions?: DialogAction[];
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;

    // Styling
    size?: "sm" | "md" | "lg" | "xl" | "full";
    className?: string;
    contentClassName?: string;
    headerClassName?: string;
    footerClassName?: string;

    // Accessibility
    "aria-label"?: string;
    "aria-describedby"?: string;
}

const sizeVariants = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-lg",
    lg: "sm:max-w-3xl",
    xl: "sm:max-w-5xl",
    full: "sm:max-w-full sm:max-h-[90vh] sm:m-4",
};

const Dialog = ({
    trigger,
    open,
    onOpenChange,
    title,
    description,
    children,
    actions,
    showCloseButton = true,
    closeOnOverlayClick = true,
    size = "md",
    className,
    contentClassName,
    headerClassName,
    footerClassName,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
}: DialogProps) => {
    return (
        <ShadDialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogOverlay className="backdrop-blur-xs bg-black/10" />
            <DialogContent
                className={cn(
                    "max-h-[calc(100vh-100px)] overflow-y-auto",
                    sizeVariants[size],
                    contentClassName
                )}
                showCloseButton={showCloseButton}
                onPointerDownOutside={
                    closeOnOverlayClick ? undefined : (e) => e.preventDefault()
                }
                onEscapeKeyDown={
                    closeOnOverlayClick ? undefined : (e) => e.preventDefault()
                }
                aria-label={ariaLabel}
                aria-describedby={ariaDescribedBy}
            >
                {(title || description) && (
                    <DialogHeader className={cn("text-left", headerClassName)}>
                        {title && <DialogTitle>{title}</DialogTitle>}
                        {description && (
                            <DialogDescription>{description}</DialogDescription>
                        )}
                    </DialogHeader>
                )}

                <div className={cn("flex-1", className)}>{children}</div>

                {actions && actions.length > 0 && (
                    <DialogFooter
                        className={cn("sm:justify-end gap-2", footerClassName)}
                    >
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant || "default"}
                                onClick={action.onClick}
                                disabled={action.disabled || action.loading}
                                className="min-w-[80px]"
                            >
                                {action.loading && (
                                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {action.label}
                            </Button>
                        ))}
                    </DialogFooter>
                )}
            </DialogContent>
        </ShadDialog>
    );
};

// Additional convenience components for more complex use cases
const ConfirmDialog = ({
    title = "Confirm Action",
    description = "Are you sure you want to continue?",
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "destructive" as const,
    isLoading = false,
    ...props
}: Omit<DialogProps, "actions"> & {
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost";
    isLoading?: boolean;
}) => {
    const handleCancel = () => {
        onCancel?.();
        props.onOpenChange?.(false);
    };

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Dialog
            {...props}
            title={title}
            description={description}
            actions={[
                {
                    label: cancelText,
                    onClick: handleCancel,
                    variant: "outline",
                    disabled: isLoading,
                },
                {
                    label: confirmText,
                    onClick: handleConfirm,
                    variant: confirmVariant,
                    loading: isLoading,
                },
            ]}
            closeOnOverlayClick={!isLoading}
        />
    );
};

// Form dialog wrapper
const FormDialog = ({
    onSubmit,
    onCancel,
    submitText = "Save",
    cancelText = "Cancel",
    isSubmitting = false,
    ...props
}: Omit<DialogProps, "actions"> & {
    onSubmit: () => void;
    onCancel?: () => void;
    submitText?: string;
    cancelText?: string;
    isSubmitting?: boolean;
}) => {
    const handleCancel = () => {
        onCancel?.();
        props.onOpenChange?.(false);
    };

    return (
        <Dialog
            {...props}
            actions={[
                {
                    label: cancelText,
                    onClick: handleCancel,
                    variant: "outline",
                    disabled: isSubmitting,
                },
                {
                    label: submitText,
                    onClick: onSubmit,
                    variant: "default",
                    loading: isSubmitting,
                },
            ]}
            closeOnOverlayClick={!isSubmitting}
        />
    );
};

export default Dialog;
export { ConfirmDialog, FormDialog, DialogClose };
