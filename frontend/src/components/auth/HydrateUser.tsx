"use client";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types/user";
import { useEffect } from "react";

const HydrateUser = ({ user }: { user: User }) => {
    const {
        setWorkspaces,
        setSelectedWorkspace,
        setMyRoleInSelectedWorkspace,
        setUser,
        setHydrated,
    } = useAuthStore((s) => s);

    useEffect(() => {
        if (user) {
            setUser(user);
            setWorkspaces(user.workspaces);
            setSelectedWorkspace(user.currentWorkspace || null);
            setMyRoleInSelectedWorkspace(
                user._id == user.currentWorkspace?.ownerId ? "admin" : "member"
            );
        }
        setHydrated();
    }, [user, setUser, setHydrated]);

    return null;
};

export default HydrateUser;
