"use client";
import { useLogoutMutation } from "@/api/queries/auth";
import { Slot } from "@radix-ui/react-slot";
import { ComponentProps, MouseEvent } from "react";

const LogoutHandler = ({
    asChild,
    ...props
}: ComponentProps<"button"> & {
    asChild?: boolean;
    className?: string;
}) => {
    const { mutate: logout } = useLogoutMutation();
    const Comp = asChild ? Slot : "button";
    const handleLogout = async (event: MouseEvent) => {
        event.preventDefault();
        logout();
    };

    return (
        <Comp onClick={handleLogout} data-slot="logout-handler" {...props} />
    );
};

export default LogoutHandler;
