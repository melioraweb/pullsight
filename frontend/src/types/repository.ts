export interface Repository {
    _id: string;
    id: string;
    external_id: number;
    name: string;
    author?: {
        username: string;
        avatarUrl: string;
    };
    slug: string;
    ignore: string[];
    minSeverity: "Info" | "Minor" | "Major" | "Critical" | "Blocker";
    createdOn?: string;
    createdAt: string;
    updatedAt: string;
    time?: string;
    provider: "github" | "bitbucket";
    integrations?: {
        bitbucket?: {
            connected: boolean;
            connected_at?: string;
        };
        jira?: {
            connected: boolean;
            connected_at?: string;
            url?: string;
        };
    };
}
