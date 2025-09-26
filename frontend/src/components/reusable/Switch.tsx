"use client";

import React from "react";
import { Switch as ShadSwitch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    className?: string;
    label?: string;
    description?: string;
    error?: string;
    size?: "sm" | "md" | "lg";
}

const Switch = ({
    checked,
    defaultChecked,
    onCheckedChange,
    disabled = false,
    required = false,
    name,
    id,
    className,
    label,
    description,
    error,
    size = "md",
    ...props
}: SwitchProps) => {
    const sizeClasses = {
        sm: "h-4 w-7",
        md: "h-[1.15rem] w-8", // Default shadcn size
        lg: "h-6 w-10",
    };

    const switchElement = (
        <ShadSwitch
            id={id || name}
            name={name}
            checked={checked}
            defaultChecked={defaultChecked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            required={required}
            className={cn(sizeClasses[size], className)}
            {...props}
        />
    );

    // If no label, return just the switch
    if (!label && !description && !error) {
        return switchElement;
    }

    // Return with label and additional elements
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-3">
                {switchElement}
                <div className="flex flex-col">
                    {label && (
                        <label
                            htmlFor={id || name}
                            className={cn(
                                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {label}
                            {required && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </label>
                    )}
                    {description && (
                        <p
                            className={cn(
                                "text-xs text-muted-foreground mt-1",
                                disabled && "opacity-50"
                            )}
                        >
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};

export default Switch;
