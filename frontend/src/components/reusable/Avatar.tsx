import { cn } from "@/lib/utils";
import Image from "next/image";
import { FC, memo, useMemo, useState } from "react";

interface Props {
    src: string;
    className?: string;
    name?: string;
    size?: "sm" | "md" | "lg";
    description?: string;
    hideDetails?: boolean;
}

const Avatar: FC<Props> = ({
    src,
    className,
    name,
    size = "md",
    description,
    hideDetails = false,
}) => {
    const [hasError, setHasError] = useState(false);
    const random = Math.floor(Math.random() * 7) + 1;
    const bgClass = useMemo(() => {
        return {
            1: "bg-red-200 text-red-800",
            2: "bg-yellow-200 text-yellow-800",
            3: "bg-green-200 text-green-800",
            4: "bg-blue-200 text-blue-800",
            5: "bg-indigo-200 text-indigo-800",
            6: "bg-purple-200 text-purple-800",
            7: "bg-pink-200 text-pink-800",
        }[random];
    }, [random]);

    const sizeClass = useMemo(() => {
        return {
            sm: "w-8 h-8 text-sm",
            md: "w-9 h-9 text-base",
            lg: "w-10 h-10 text-lg",
        }[size];
    }, [size]);
    const sizeNum = useMemo(() => {
        return {
            sm: 32,
            md: 36,
            lg: 40,
        }[size];
    }, [size]);

    const fontSizeClass = useMemo(() => {
        return {
            sm: "text-[12px]",
            md: "text-[14px]",
            lg: "text-lg",
        }[size];
    }, [size]);

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {true ? (
                <Image
                    src={
                        src && !hasError ? src : "/images/user_placeholder.png"
                    }
                    alt={
                        src && !hasError
                            ? name || ""
                            : "Default Author Placeholder"
                    }
                    className={`border rounded-full`}
                    height={sizeNum}
                    width={sizeNum}
                    onError={() => setHasError(true)}
                />
            ) : (
                <div
                    className={cn(
                        `flex items-center justify-center rounded-full`,
                        bgClass,
                        sizeClass
                    )}
                >
                    <div className="font-medium capitalize">
                        {name?.charAt(0)}
                    </div>
                </div>
            )}
            {!hideDetails && (
                <div className="flex-1 min-w-0">
                    <div
                        className={cn("text-gray-300 truncate", fontSizeClass)}
                    >
                        {name}
                    </div>
                    <div className="text-[12px] text-slate-400">
                        {description}
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(Avatar);
