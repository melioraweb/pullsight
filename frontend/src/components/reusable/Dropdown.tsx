import { Children, ElementType, FC, ReactNode } from "react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DropDownProps {
    children: ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    align?: "start" | "end" | "center";
}

interface DropdownTriggerProps {
    children: ReactNode;
}

interface DropdownContentProps {
    className?: string;
    children: ReactNode;
}

interface DropdownItemProps {
    className?: string;
    children?: ReactNode;
    onClick?: () => void;
    icon?: ElementType;
    label?: string;
    to?: string;
}

const Dropdown: FC<DropDownProps> & {
    Trigger: typeof DropdownTrigger;
    Content: typeof DropdownContent;
    Item: typeof DropdownItem;
} = ({ position = "bottom", align = "end", children }) => {
    const childrenArray = Children.toArray(children);

    const trigger: any = childrenArray.find(
        (child: any) => child.type.displayName === "DropdownTrigger"
    );
    const content: any = childrenArray.find(
        (child: any) => child.type.displayName === "DropdownContent"
    );

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                {trigger?.props.children}
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
                <DropdownMenuContent
                    align={align}
                    side={position}
                    sideOffset={0}
                    className={cn("rounded-xl", content?.props.className)}
                >
                    {content?.props.children}
                </DropdownMenuContent>
            </DropdownMenuPortal>
        </DropdownMenu>
    );
};

const DropdownTrigger: FC<DropdownTriggerProps> = ({ children }) => {
    return <>{children}</>;
};

const DropdownContent: FC<DropdownContentProps> = ({ children }) => {
    return <>{children}</>;
};

const DropdownItem: FC<DropdownItemProps> = ({
    children,
    onClick,
    to,
    className,
    icon: Icon,
    label,
}) => {
    if (to) {
        return (
            <DropdownMenuItem asChild>
                <Link
                    href={to}
                    className={cn(
                        "w-full h-[40px] flex items-center rounded-lg gap-2",
                        className
                    )}
                >
                    {Icon && <Icon className="h-5 text-gray-400" />}
                    {label && (
                        <span className="text-sm font-medium">{label}</span>
                    )}
                    {children && children}
                </Link>
            </DropdownMenuItem>
        );
    }

    return (
        <DropdownMenuItem
            className={cn("h-[40px] rounded-lg", className)}
            onClick={onClick}
        >
            {Icon && <Icon className="h-5 text-gray-400" />}
            {label && <span className="text-sm font-medium">{label}</span>}
            {children && children}
        </DropdownMenuItem>
    );
};

Dropdown.displayName = "Dropdown";
DropdownContent.displayName = "DropdownContent";
DropdownTrigger.displayName = "DropdownTrigger";
DropdownItem.displayName = "DropdownItem";

Dropdown.Trigger = DropdownTrigger;
Dropdown.Content = DropdownContent;
Dropdown.Item = DropdownItem;

export default Dropdown;
