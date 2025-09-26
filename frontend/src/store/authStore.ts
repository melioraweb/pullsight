import { Organization, WorkspaceSetting } from "@/types/organization";
import { User } from "@/types/user";
import { create } from "zustand";

type AuthState = {
    hydrated: boolean;
    user: User | null;
    myRoleInSelectedWorkspace: string | null;
    selectedWorkspace: Organization | null;
    workspaces: Organization[] | null;
};

interface AuthActions {
    setHydrated: () => void;
    setUser: (user: User) => void;
    setMyRoleInSelectedWorkspace: (role: string | null) => void;
    setSelectedWorkspace: (workspace: Organization | null) => void;
    setWorkspaces: (workspaces: Organization[] | null) => void;
    updateWorkspaceSettings: (settings: Partial<WorkspaceSetting>) => void;
    clearStore: () => void;
}

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set) => ({
    hydrated: false,
    user: null,
    myRoleInSelectedWorkspace: null,
    selectedWorkspace: null,
    workspaces: null,
    setHydrated: (): void => set({ hydrated: true }),
    setUser: (user: User): void => set({ user }),
    setMyRoleInSelectedWorkspace: (role: string | null): void =>
        set({ myRoleInSelectedWorkspace: role }),
    setSelectedWorkspace: (workspace: Organization | null): void =>
        set({ selectedWorkspace: workspace }),
    setWorkspaces: (workspaces: Organization[] | null): void =>
        set({ workspaces }),
    updateWorkspaceSettings: (settings: Partial<WorkspaceSetting>): void =>
        set((state) => ({
            user: state.user
                ? {
                      ...state.user,
                      currentWorkspace: state.user.currentWorkspace
                          ? {
                                ...state.user.currentWorkspace,
                                workspaceSetting: {
                                    ...state.user.currentWorkspace
                                        .workspaceSetting,
                                    ...settings,
                                },
                            }
                          : state.user.currentWorkspace,
                  }
                : state.user,
        })),
    clearStore: (): void =>
        set({
            user: null,
            selectedWorkspace: null,
            workspaces: null,
        }),
}));
