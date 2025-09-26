"use client";
import React, { ReactNode } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface SelectableListProps<TItem> {
    selectedId?: string;
    onSelect?: (id: string) => void;
    wrapperClassName?: string;
    className?: string;
    itemClassName?: string;
    items: TItem[];
    getKey: (item: TItem) => string;
    isDisabled?: (item: TItem) => boolean;
    renderHeader?: () => ReactNode;
    renderItem?: (
        item: TItem,
        opts: {
            checked: boolean;
            disabled: boolean;
        }
    ) => ReactNode;
}

const SelectableList = <TItem,>({
    items,
    selectedId,
    onSelect,
    wrapperClassName = "",
    className = "",
    itemClassName = "",
    renderHeader,
    renderItem,
    getKey,
    isDisabled,
}: SelectableListProps<TItem>) => {
    return (
        <div className={cn(wrapperClassName)}>
            {renderHeader && <div className="py-2px-4">{renderHeader()}</div>}
            <RadioGroup
                value={selectedId}
                onValueChange={onSelect}
                className={cn("gap-2 w-full", className)}
            >
                {items.map((item: TItem) => {
                    const key = getKey(item);
                    const checked = selectedId === key;
                    const disabled = isDisabled ? isDisabled(item) : false;

                    return (
                        <div
                            key={key}
                            onClick={() => !disabled && onSelect?.(key)}
                            className={cn(
                                "flex items-center gap-5 rounded-lg py-3 px-4",
                                checked ? "bg-white/5" : "",
                                disabled
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer",
                                itemClassName
                            )}
                        >
                            <RadioGroupItem
                                value={key}
                                id={`item-${key}`}
                                checked={checked}
                                disabled={disabled}
                                className=""
                            />
                            {renderItem
                                ? renderItem(item, { checked, disabled })
                                : null}
                        </div>
                    );
                })}
            </RadioGroup>
        </div>
    );
};

export default SelectableList;
