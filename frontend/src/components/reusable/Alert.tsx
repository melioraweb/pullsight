"use client";

import React from "react";
import {
    Alert as ShadAlert,
    AlertTitle,
    AlertDescription,
} from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Info, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface AlertProps {
    variant?: "default" | "destructive" | "success" | "warning" | "info";
    title?: string;
    description?: string | React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    showIcon?: boolean;
    icon?: React.ReactNode;
}

const Alert = ({
    variant = "default",
    title,
    description,
    children,
    className,
    showIcon = true,
    icon,
    ...props
}: AlertProps) => {
    const getVariantClasses = () => {
        switch (variant) {
            case "destructive":
                return "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200";
            case "success":
                return "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200";
            case "warning":
                return "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
            case "info":
                return "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
            default:
                return "bg-card text-card-foreground";
        }
    };

    const getIcon = () => {
        if (icon) return icon;
        if (!showIcon) return null;

        switch (variant) {
            case "destructive":
                return <XCircle className="h-4 w-4" />;
            case "success":
                return <CheckCircle className="h-4 w-4" />;
            case "warning":
                return <AlertCircle className="h-4 w-4" />;
            case "info":
                return <Info className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    return (
        <ShadAlert className={cn(getVariantClasses(), className)} {...props}>
            {getIcon()}
            {title && <AlertTitle>{title}</AlertTitle>}
            {description && (
                <AlertDescription>
                    {typeof description === "string" ? (
                        <p>{description}</p>
                    ) : (
                        description
                    )}
                </AlertDescription>
            )}
            {children}
        </ShadAlert>
    );
};

export default Alert;
