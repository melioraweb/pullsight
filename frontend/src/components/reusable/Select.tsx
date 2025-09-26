"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps
    extends Omit<
        React.SelectHTMLAttributes<HTMLSelectElement>,
        "onChange" | "size"
    > {
    options: SelectOption[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    error?: string;
    label?: string;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "outline" | "ghost";
}

const Select = ({
    options,
    value,
    defaultValue,
    onChange,
    placeholder,
    className,
    disabled = false,
    required = false,
    name = "",
    id = "",
    error,
    label,
    size = "md",
    variant = "default",
    ...props
}: SelectProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e.target.value);
    };

    const sizeClasses = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-2 text-sm",
        lg: "px-4 py-3 text-base",
    };

    const variantClasses = {
        default:
            "border bg-card text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        outline:
            "border border-gray-700 bg-transparent text-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-gray-500",
        ghost: "border-0 bg-transparent text-gray-300 focus:ring-2 focus:ring-gray-500",
    };

    const selectClasses = cn(
        "rounded-md transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        "focus:outline-none focus:ring-offset-2 focus:ring-offset-background",
        sizeClasses[size],
        variantClasses[variant],
        error && "border-red-500 focus:ring-red-500 focus:border-red-500",
        className
    );

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label
                    htmlFor={id || name}
                    className={cn(
                        "text-sm font-medium ",
                        disabled && "opacity-50"
                    )}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <select
                id={id || name}
                name={name}
                value={value}
                defaultValue={defaultValue}
                onChange={handleChange}
                disabled={disabled}
                required={required}
                className={selectClasses}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <span className="text-xs text-red-500 mt-1">{error}</span>
            )}
        </div>
    );
};

export default Select;
