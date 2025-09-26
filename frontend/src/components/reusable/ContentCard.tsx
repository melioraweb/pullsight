import { FC, ReactNode } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ContentCardProps {
    className?: string;
    children: ReactNode;
}
interface HeaderProps {
    className?: string;
    children?: ReactNode;
}

interface BodyProps {
    className?: string;
    children?: ReactNode;
    hasError?: boolean;
    errorLabel?: string;
    isLoading?: boolean;
    noContentLabel?: string;
}

const Header: FC<HeaderProps> = ({ className, children }) => {
    return (
        <CardHeader
            className={cn(
                "pt-4 pb-2 px-4 gap-y-0 flex justify-between items-center",
                className
            )}
        >
            {children}
        </CardHeader>
    );
};

const Body: FC<BodyProps> = ({
    className,
    children,
    isLoading,
    hasError,
    errorLabel,
    noContentLabel,
}) => {
    return (
        <CardContent
            className={cn(
                "pt-3 pb-4 px-4 relative min-h-[100px] custom-scrollbar",
                { "overflow-y-auto": !isLoading },
                className
            )}
        >
            {children}
            {noContentLabel && !hasError && !isLoading && (
                <p className="text-[var(--subtitle-400)] text-center p-5">
                    {noContentLabel}
                </p>
            )}
            {hasError && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark/50 backdrop-blur-sm">
                    <p className="text-muted-foreground">
                        {errorLabel || "Error loading content."}
                    </p>
                </div>
            )}
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark/50 backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}
        </CardContent>
    );
};

const ContentCard = ({ className, children }: ContentCardProps) => {
    return (
        <Card
            className={cn("py-0 gap-y-0 border-0 overflow-hidden", className)}
        >
            {children}
        </Card>
    );
};

ContentCard.Body = Body;
ContentCard.Header = Header;

ContentCard.displayName = "ContentCard";
ContentCard.Header.displayName = "ContentCard.Header";
ContentCard.Body.displayName = "ContentCard.Body";

export default ContentCard;
