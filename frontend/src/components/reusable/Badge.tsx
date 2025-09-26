import { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge as ShadBadge } from "../ui/badge";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: ReactNode;
    variant?:
        | "default"
        | "primary"
        | "secondary"
        | "destructive"
        | "info"
        | "success"
        | "warning";
    type?: "solid" | "outline" | "faded";
}

const variantSolid: Record<string, string> = {
    default: "bg-primary text-primary-foreground border-transparent",
    primary: "bg-blue-600 text-white border-transparent",
    secondary: "bg-secondary text-secondary-foreground border-transparent",
    destructive: "bg-destructive text-white border-transparent",
    success: "bg-green-600 text-white border-transparent",
    warning: "bg-yellow-500 text-black border-transparent",
    info: "bg-blue-500 text-white border-transparent",
};

const variantOutline: Record<string, string> = {
    default: "bg-transparent text-primary border border-primary",
    primary: "bg-transparent text-blue-600 border border-blue-600",
    secondary: "bg-transparent text-secondary border border-secondary",
    destructive: "bg-transparent text-destructive border border-destructive",
    success: "bg-transparent text-green-600 border border-green-600",
    warning: "bg-transparent text-yellow-500 border border-yellow-500",
    info: "bg-transparent text-blue-500 border border-blue-500",
};

const variantFaded: Record<string, string> = {
    default: "bg-primary/20 text-primary border-transparent",
    primary: "bg-blue-600/20 text-blue-600 border-transparent",
    secondary: "bg-secondary/20 text-secondary border-transparent",
    destructive: "bg-destructive/20 text-destructive border-transparent",
    success: "bg-green-600/20 text-green-600 border-transparent",
    warning: "bg-yellow-500/20 text-yellow-600 border-transparent",
    info: "bg-blue-500/20 text-blue-500 border-transparent",
};

const Badge: FC<BadgeProps> = ({
    className,
    variant = "default",
    type = "solid",
    ...rest
}) => {
    const classes =
        type === "outline"
            ? variantOutline[variant]
            : type === "faded"
            ? variantFaded[variant]
            : variantSolid[variant];

    return (
        <ShadBadge
            className={cn(
                "inline-flex items-center justify-center rounded-xl capitalize px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-colors",
                classes,
                className
            )}
            {...rest}
        />
    );
};

export default Badge;
