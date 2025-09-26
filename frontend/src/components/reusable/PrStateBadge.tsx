import Badge from "./Badge";

const PrStateBadge = ({ state }: { state: string }) => {
    const variant =
        state === "closed" || state === "merged"
            ? "success"
            : state === "declined" || state === "rejected"
            ? "destructive"
            : "default";

    return (
        <Badge variant={variant} className="" type="faded">
            {state}
        </Badge>
    );
};

export default PrStateBadge;
