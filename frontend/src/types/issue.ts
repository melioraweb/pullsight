export interface Issue {
    _id: string;
    repositorySlug: string;
    filePath: string;
    lineStart: number;
    lineEnd: number;
    content: string;
    severity: string;
    category: string;
    daysOpen: number;
    status: string;
    id: string;
    pr: string;
    owner: string;
    prUser: string;
    updated: string;
    prNumber: string;
    prState: string;
    prUrl: string;
    codeSnippet: string;
    codeSnippetLineStart: number;
    codeSnippetLineEnd: number;
}
