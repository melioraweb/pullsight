"use client";

import React from "react";
import { Button as ShadButton, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

interface ButtonProps
    extends React.ComponentProps<"button">,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    loadingPosition?: "start" | "end" | "replace";
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    loadingComponent?: React.ReactNode;
    fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            isLoading = false,
            loadingText,
            loadingPosition = "start",
            leftIcon,
            rightIcon,
            loadingComponent,
            fullWidth = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        // Create loading indicator
        const loadingIndicator = loadingComponent || (
            <Loader2Icon className="animate-spin" />
        );

        // Determine if button should be disabled
        const isDisabled = disabled || isLoading;

        // Determine button content based on loading state
        const getButtonContent = () => {
            if (isLoading) {
                switch (loadingPosition) {
                    case "replace":
                        return (
                            <>
                                {loadingIndicator}
                                {loadingText && <span>{loadingText}</span>}
                            </>
                        );
                    case "end":
                        return (
                            <>
                                {leftIcon && (
                                    <span className="shrink-0">{leftIcon}</span>
                                )}
                                <span>{loadingText || children}</span>
                                {loadingIndicator}
                            </>
                        );
                    case "start":
                    default:
                        return (
                            <>
                                {loadingIndicator}
                                <span>{loadingText || children}</span>
                                {rightIcon && (
                                    <span className="shrink-0">
                                        {rightIcon}
                                    </span>
                                )}
                            </>
                        );
                }
            }

            // Normal content when not loading
            return (
                <>
                    {leftIcon && <span className="shrink-0">{leftIcon}</span>}
                    <span>{children}</span>
                    {rightIcon && <span className="shrink-0">{rightIcon}</span>}
                </>
            );
        };

        return (
            <ShadButton
                ref={ref}
                className={cn(fullWidth && "w-full", className)}
                variant={variant}
                size={size}
                asChild={asChild}
                disabled={isDisabled}
                aria-busy={isLoading}
                aria-describedby={isLoading ? "loading-description" : undefined}
                {...props}
            >
                {getButtonContent()}
            </ShadButton>
        );
    }
);

Button.displayName = "Button";

export default Button;
