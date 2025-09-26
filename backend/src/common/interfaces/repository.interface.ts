export interface Repository {
    id: number
    name: string
    fullName: string
    slug: string
    private: boolean
    author: {
        username: string
        avatarUrl: string
    }
    createdOn: string
    updatedOn: string
    openIssues: number
}

export interface PullRequestResponse {
    provider: string
    prId: number
    prNumber: number
    prTitle: string
    prState: string
    prUser: string
    prUserAvatar: string
    prCreatedAt: string // ISO date string
    prUpdatedAt: string
    prClosedAt: string | null
    prMergedAt: string | null
    prUrl: string
}
