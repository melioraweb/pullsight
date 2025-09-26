import Badge from "./Badge";

const SeverityBadge = ({ severity }: { severity: string }) => {
    const className: Record<string, string> = {
        blocker: "bg-red-800 text-white",
        critical: "bg-red-500 text-white",
        major: "bg-orange-400 text-white",
        minor: "bg-yellow-400 text-white",
        info: "bg-blue-400 text-white",
    };

    return (
        <Badge
            className={
                className?.[severity?.toLowerCase()] || "bg-gray-500 text-white"
            }
            type="faded"
        >
            {severity}
        </Badge>
    );
};

export default SeverityBadge;
