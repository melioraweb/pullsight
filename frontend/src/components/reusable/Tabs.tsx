"use client";

import React from "react";
import {
    Tabs as ShadTabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabItem {
    value: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
}

interface TabsProps {
    items?: TabItem[];
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    listClassName?: string;
    triggerClassName?: string;
    contentClassName?: string;
    orientation?: "horizontal" | "vertical";
    children?: React.ReactNode;
}

const Tabs = ({
    items,
    defaultValue,
    value,
    onValueChange,
    className,
    listClassName,
    triggerClassName,
    contentClassName,
    orientation = "horizontal",
    children,
}: TabsProps) => {
    // If children are provided, use compound component pattern
    if (children) {
        return (
            <ShadTabs
                defaultValue={defaultValue}
                value={value}
                onValueChange={onValueChange}
                orientation={orientation}
                className={cn("w-full", className)}
            >
                {children}
            </ShadTabs>
        );
    }

    // If items are provided, use array-based pattern
    if (items && items.length > 0) {
        return (
            <ShadTabs
                defaultValue={defaultValue || items[0]?.value}
                value={value}
                onValueChange={onValueChange}
                orientation={orientation}
                className={cn("w-full", className)}
            >
                <TabsList
                    className={cn(
                        "flex gap-2 border rounded-md overflow-hidden bg-transparent p-0 h-auto",
                        listClassName
                    )}
                >
                    {items.map((item) => (
                        <TabsTrigger
                            key={item.value}
                            value={item.value}
                            disabled={item.disabled}
                            className={cn(
                                "px-3 py-2 rounded-md text-sm font-medium border-0 shadow-none dark:data-[state=active]:bg-neutral-700 data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent",
                                triggerClassName
                            )}
                        >
                            {item.icon && (
                                <span className="mr-2">{item.icon}</span>
                            )}
                            {item.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {items.map((item) => (
                    <TabsContent
                        key={item.value}
                        value={item.value}
                        className={cn("", contentClassName)}
                    >
                        {item.content}
                    </TabsContent>
                ))}
            </ShadTabs>
        );
    }

    // Fallback: just return the root with basic props
    return (
        <ShadTabs
            defaultValue={defaultValue}
            value={value}
            onValueChange={onValueChange}
            orientation={orientation}
            className={cn("w-full", className)}
        />
    );
};

// Enhanced compound components with default styling
const TabsListWithDefaults = ({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof TabsList>) => (
    <TabsList
        className={cn(
            "flex gap-2 border rounded-md overflow-hidden bg-transparent p-0 h-auto",
            className
        )}
        {...props}
    />
);

const TabsTriggerWithDefaults = ({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof TabsTrigger>) => (
    <TabsTrigger
        className={cn(
            "px-3 py-2 rounded-md text-sm font-medium border-0 shadow-none dark:data-[state=active]:bg-neutral-700 data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent",
            className
        )}
        {...props}
    />
);

Tabs.List = TabsListWithDefaults;
Tabs.Trigger = TabsTriggerWithDefaults;
Tabs.Content = TabsContent;

export default Tabs;
