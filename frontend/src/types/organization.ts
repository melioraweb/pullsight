import { Provider } from "./user";

export interface WorkspaceSetting {
    hourlyRate?: number;
    useOwnApiKey?: boolean;
    apiKey?: string;
    model?: string;
}

export interface Organization {
    _id: string;
    id: string;
    name: string;
    slug?: string;
    provider: Provider;
    ownerId?: string;
    nodeId: string;
    url: string;
    avatarUrl?: string | null;
    reposUrl?: string;
    type?: "Organization" | "User";
    installationId?: string;
    createdOn?: string;
    createdAt?: string;
    updatedAt?: string;
    workspaceSetting?: WorkspaceSetting;
    onboardingStep?: number;
    noOfActiveMembers?: number;
}
