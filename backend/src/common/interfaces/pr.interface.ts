export interface PRFile {
    prFileName: string
    prFileStatus: string
    prFileAdditions: number
    prFileDeletions: number
    prFileChanges: number
    prFileContentBefore: string
    prFileContentAfter: string
    prFileDiff: string
    prFileDiffHunks: string[]
    prFileBlobUrl: string
}

export interface PullRequestData {
    provider: string
    prId: string
    prUser: string
    prUserAvatar: string
    prUrl: string
    owner: string
    repo: string
    prNumber: string
    installationId: string
    prRepoName: string
    prTitle: string
    prBody: string
    prState: string
    prCreatedAt: string
    prUpdatedAt: string
    prClosedAt: string
    prMergedAt: string
    prHeadBranch: string
    prBaseBranch: string
    prHeadSha: string
    prBaseSha: string
    prFilesChanged: number
    prTotalLineAddition: number
    prTotalLineDeletion: number
    prFiles: PRFile[]
}

export interface StructuredPRData {
    pullRequest: PullRequestData
}
