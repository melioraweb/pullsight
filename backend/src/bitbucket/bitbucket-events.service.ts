import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { mapPREventToState, PREvent } from 'src/common/enums/pr.enum'
import { HttpService } from 'src/common/http/http.service'
import { PRFile, StructuredPRData } from 'src/common/interfaces/pr.interface'
import { DatabaseService } from 'src/database/database.service'
import { PullRequestAnalysisComment } from 'src/database/schemas/pull-request-analysis-comment.schema'
import { PullRequestAnalysis } from 'src/database/schemas/pull-request-analysis.schema'
import { BitbucketApiService } from './bitbucket-api.service'

@Injectable()
export class BitbucketEventsService {
    private readonly baseUrl = 'https://api.bitbucket.org/2.0'
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly dataService: DatabaseService,
        private readonly bitbucketApiService: BitbucketApiService
    ) {}

    async handleBitbucketPullRequest(
        payload: any,
        event: PREvent
    ): Promise<StructuredPRData> {
        const pullRequest = payload.pullrequest
        const repository = payload.repository

        if (!pullRequest || !repository) {
            throw new Error('Invalid Bitbucket pull request payload')
        }
        // Try to get access token from database based on repository owner
        const workspace =
            repository.workspace?.slug || repository.full_name?.split('/')[0]
        const accessToken = await this.getAccessTokenForWorkspace(workspace)

        // Get pull request files using Bitbucket API
        const files = await this.fetchPRFiles(
            workspace,
            repository.name,
            pullRequest.id,
            accessToken
        )
        const prFiles: PRFile[] = []

        const fullDiff = await this.bitbucketApiService.fetchPRDiff(
            workspace,
            repository.name,
            pullRequest.id,
            accessToken
        )

        // Calculate total lines added and deleted across all files
        const totalPrLineAdditions = files.reduce(
            (sum, file) => sum + (file.lines_added || 0),
            0
        )
        const totalPrLineDeletion = files.reduce(
            (sum, file) => sum + (file.lines_removed || 0),
            0
        )

        // Process each file to get before/after content
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const contentBefore = await this.fetchFileContent(
                workspace,
                repository.name,
                file.old?.path || file.new?.path,
                pullRequest.destination?.branch?.name,
                accessToken
            )
            const contentAfter = await this.fetchFileContent(
                workspace,
                repository.name,
                file.new?.path || file.old?.path,
                pullRequest.source?.branch?.name,
                accessToken
            )

            // Extract individual file diff from the full diff
            const fileName = file.new?.path || file.old?.path
            const individualFileDiff = this.bitbucketApiService.extractFileDiff(
                fullDiff,
                fileName
            )

            prFiles.push({
                prFileName: fileName,
                prFileStatus: file.status,
                prFileAdditions: file.lines_added || 0,
                prFileDeletions: file.lines_removed || 0,
                prFileChanges:
                    (file.lines_added || 0) + (file.lines_removed || 0),
                prFileContentBefore:
                    contentBefore || 'File not found in destination branch',
                prFileContentAfter:
                    contentAfter || 'File not found in source branch',
                prFileDiff: individualFileDiff,
                prFileDiffHunks: this.parseDiffHunks(individualFileDiff),
                prFileBlobUrl:
                    file.new?.links?.self?.href ||
                    file.old?.links?.self?.href ||
                    ''
            })
        }

        const comprehensiveAnalysis: StructuredPRData = {
            pullRequest: {
                provider: 'bitbucket',
                prId: pullRequest.id.toString(),
                prUser: pullRequest.author?.nickname,
                prUserAvatar: pullRequest.author?.links?.avatar?.href || '',
                owner: workspace || 'unknown',
                repo: repository.slug || repository.name,
                prNumber: pullRequest.id.toString(),
                installationId: 'bitbucket_integration', // Bitbucket doesn't have installation concept
                prRepoName: repository.full_name,
                prTitle: pullRequest.title,
                prBody: pullRequest.description || '',
                prUrl: pullRequest.links?.html?.href || '',
                prState: mapPREventToState(event),
                prCreatedAt: pullRequest.created_on,
                prUpdatedAt: pullRequest.updated_on,
                prClosedAt: pullRequest.closed_on || '',
                prMergedAt: pullRequest.merged_on || '',
                prHeadBranch: pullRequest.source?.branch?.name || 'unknown',
                prBaseBranch:
                    pullRequest.destination?.branch?.name || 'unknown',
                prHeadSha: pullRequest.source?.commit?.hash || 'unknown',
                prBaseSha: pullRequest.destination?.commit?.hash || 'unknown',
                prFilesChanged: files.length,
                prTotalLineAddition: totalPrLineAdditions,
                prTotalLineDeletion: totalPrLineDeletion,
                prFiles: prFiles
            }
        }
        return comprehensiveAnalysis
    }

    private async getAccessTokenForWorkspace(
        workspace: string
    ): Promise<string> {
        const workspaceRecord = await this.dataService.workspaces.findOne({
            slug: workspace,
            provider: 'bitbucket'
        })

        if (workspaceRecord?._id) {
            let userData = await this.dataService.users.findOne(
                {
                    _id: workspaceRecord.ownerId
                },
                'accessToken refreshToken tokenExpiresAt'
            )

            if (!userData?.accessToken) {
                throw new BadRequestException(
                    'No user found with access token for the provided Bitbucket workspace'
                )
            }

            const now = new Date()
            const expiryBuffer = 5 * 60 * 1000 // 5 minutes in milliseconds
            const isTokenExpired =
                userData.tokenExpiresAt &&
                new Date(userData.tokenExpiresAt).getTime() <
                    now.getTime() + expiryBuffer
            if (isTokenExpired && userData.refreshToken) {
                const newTokens =
                    await this.bitbucketApiService.refreshAccessToken(
                        userData.refreshToken
                    )
                if (newTokens && newTokens.access_token) {
                    const tokenExpiresAt = new Date(
                        Date.now() + (newTokens.expires_in || 7200) * 1000
                    )

                    // Update user with new tokens
                    // Bitbucket always returns a new refresh token, so use it
                    const updateData: any = {
                        accessToken: newTokens.access_token,
                        tokenExpiresAt
                    }

                    // Update refresh token if provided, otherwise keep the old one
                    if (newTokens.refresh_token) {
                        updateData.refreshToken = newTokens.refresh_token
                    }

                    await this.dataService.users.updateOne(
                        { _id: userData._id },
                        { $set: updateData }
                    )

                    return newTokens.access_token
                } else {
                    throw new BadRequestException(
                        'Failed to refresh access token'
                    )
                }
            }

            return userData.accessToken
        } else {
            throw new BadRequestException(
                'No workspace found for the provided Bitbucket slug'
            )
        }
    }

    private async fetchPRFiles(
        workspace: string,
        repository: string,
        pullRequestId: number,
        accessToken?: string | null
    ): Promise<any[]> {
        if (!accessToken) {
            console.warn('No access token provided for Bitbucket API call')
            return []
        }
        const bitbucketApiUrl = this.baseUrl || 'https://api.bitbucket.org/2.0'

        let allFiles: any[] = []
        let nextUrl = `${bitbucketApiUrl}/repositories/${workspace}/${repository}/pullrequests/${pullRequestId}/diffstat`
        while (nextUrl) {
            const response = await this.httpService.get(nextUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json'
                }
            })

            // Add current page files to the collection
            if (response.values && Array.isArray(response.values)) {
                allFiles = allFiles.concat(response.values)
            }

            // Check if there's a next page
            nextUrl = response.next || null

            // Optional: Add a safety limit to prevent infinite loops
            if (allFiles.length > 10000) {
                console.warn(
                    `Too many files in PR ${pullRequestId}, stopping at ${allFiles.length} files`
                )
                break
            }
        }

        return allFiles
    }

    private async fetchFileContent(
        workspace: string,
        repository: string,
        filePath: string,
        branch: string,
        accessToken?: string | null
    ): Promise<string | null> {
        try {
            if (!accessToken || !filePath) {
                return null
            }
            const bitbucketApiUrl =
                this.configService.get('BITBUCKET_API_URL') ||
                'https://api.bitbucket.org/2.0'

            const branchInfoUrl = `${bitbucketApiUrl}/repositories/${workspace}/${repository}/refs/branches/${encodeURIComponent(branch)}`
            const branchInfo = await this.httpService.getWithHandleCatch(
                branchInfoUrl,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/json'
                    }
                }
            )

            const commitSha = branchInfo.target?.hash
            if (!commitSha) {
                throw new Error('No commit SHA found in branch info')
            }

            const apiUrl = `${bitbucketApiUrl}/repositories/${workspace}/${repository}/src/${commitSha}/${filePath}`
            const response = await this.httpService.getWithHandleCatch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'text/plain'
                }
            })
            return String(response)
        } catch (error) {
            return null
        }
    }

    async addPRReviewComments(
        analysis: PullRequestAnalysis,
        comments: PullRequestAnalysisComment[]
    ): Promise<any> {
        const accessToken = await this.getAccessTokenForWorkspace(
            analysis.workspaceSlug
        )

        const bitbucketApiUrl = this.baseUrl
        const results: any[] = []
        for (const comment of comments) {
            const commentData = {
                content: {
                    raw: comment.content
                },
                inline: {
                    to: comment.lineEnd,
                    path: comment.filePath
                }
            }

            const apiUrl = `${bitbucketApiUrl}/repositories/${analysis.workspaceSlug}/${analysis.repositorySlug}/pullrequests/${analysis.prNumber}/comments`

            const response = await this.httpService.post(apiUrl, commentData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            })
            results.push(response)
        }
        return results
    }

    async addPRSummery(analysis: PullRequestAnalysis): Promise<any> {
        const accessToken = await this.getAccessTokenForWorkspace(
            analysis.workspaceSlug
        )
        const commentData = {
            content: {
                raw: analysis.summary
            }
        }

        const apiUrl = `${this.baseUrl}/repositories/${analysis.workspaceSlug}/${analysis.repositorySlug}/pullrequests/${analysis.prNumber}/comments`

        const response = this.httpService.post(apiUrl, commentData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        return response
    }

    private parseDiffHunks(diffContent: string): string[] {
        if (!diffContent) return []

        const hunks: string[] = []
        const hunkRegex = /@@[^@]*@@.*?(?=@@|$)/gs

        let match
        while ((match = hunkRegex.exec(diffContent)) !== null) {
            hunks.push(match[0])
        }

        return hunks
    }
}
