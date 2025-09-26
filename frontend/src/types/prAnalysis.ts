import { PullRequest } from "./pullRequest";

export interface AIComment {
    _id: string;
    metadata: unknown | null; // Metadata can be any additional information, currently not used
    filePath: string;
    lineStart: number;
    lineEnd: number;
    content: string; // Full content of the comment
    suggestion: string;
    codeSnippet: string;
    codeSnippetLineStart: number;
    severity: string; // info | minor | major | critical | blocker
    category: string;
    pullRequestAnalysisId: string; // Reference to the PR analysis this comment belongs to
    createdAt: string;
    updatedAt: string;
}

export interface PRAnalysisData {
    _id: string;
    prId: string;
    provider: "github" | "bitbucket";
    workspaceSlug: string;
    repositorySlug: string;
    prNumber: string;
    installationId: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    summary: string;
    comments: AIComment[];
}

export interface PRAnalysis {
    pullRequest?: any;
    pullRequestAnalysisId: string;
    pullRequestAnalysis?: PRAnalysisData;
}
