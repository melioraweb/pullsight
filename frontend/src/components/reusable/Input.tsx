"use client";

import React from "react";
import { Input as ShadInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    value?: string;
    defaultValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onValueChange?: (value: string) => void;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    readOnly?: boolean;
    name?: string;
    id?: string;
    className?: string;
    label?: string;
    description?: string;
    error?: string;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "outline" | "ghost";
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = ({
    value,
    defaultValue,
    onChange,
    onValueChange,
    type = "text",
    placeholder,
    disabled = false,
    required = false,
    readOnly = false,
    name,
    id,
    className,
    label,
    description,
    error,
    size = "md",
    variant = "default",
    leftIcon,
    rightIcon,
    ...props
}: InputProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        onValueChange?.(e.target.value);
    };

    const sizeClasses = {
        sm: "h-8 px-2 py-1 text-xs",
        md: "h-9 px-3 py-1 text-sm", // Default shadcn size
        lg: "h-11 px-4 py-2 text-base",
    };

    const variantClasses = {
        default: "", // Use shadcn default styling
        outline: "border-2 bg-transparent",
        ghost: "border-0 bg-transparent shadow-none",
    };

    const inputClasses = cn(
        sizeClasses[size],
        variantClasses[variant],
        error &&
            "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20",
        (leftIcon || rightIcon) && "pl-10 pr-10",
        leftIcon && !rightIcon && "pl-10 pr-3",
        rightIcon && !leftIcon && "pl-3 pr-10",
        className
    );

    const inputElement = (
        <div className="relative">
            {leftIcon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {leftIcon}
                </div>
            )}
            <ShadInput
                id={id || name}
                name={name}
                type={type}
                value={value}
                defaultValue={defaultValue}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                readOnly={readOnly}
                className={inputClasses}
                {...props}
            />
            {rightIcon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {rightIcon}
                </div>
            )}
        </div>
    );

    // If no label, return just the input
    if (!label && !description && !error) {
        return inputElement;
    }

    // Return with label and additional elements
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label
                    htmlFor={id || name}
                    className={cn(
                        "text-sm font-medium text-foreground",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {inputElement}

            {description && (
                <p
                    className={cn(
                        "text-xs text-muted-foreground",
                        disabled && "opacity-50"
                    )}
                >
                    {description}
                </p>
            )}

            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};

export default Input;
