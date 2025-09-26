import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import * as fs from 'fs'
import * as path from 'path'
import { mapPREventToState, PREvent } from 'src/common/enums/pr.enum'
import { PRFile, StructuredPRData } from 'src/common/interfaces/pr.interface'
import { DatabaseService } from 'src/database/database.service'
import { PullRequestAnalysisComment } from 'src/database/schemas/pull-request-analysis-comment.schema'
import { PullRequestAnalysis } from 'src/database/schemas/pull-request-analysis.schema'

@Injectable()
export class GithubEventService {
    private octokit: Octokit
    private privateKey: string

    constructor(
        private readonly configService: ConfigService,
        private readonly dataService: DatabaseService
    ) {
        const pemPath = path.resolve(
            this.configService.get<string>('GITHUB_PRIVATE_KEY_PATH') || ''
        )
        this.privateKey = fs.readFileSync(pemPath, 'utf8')
    }

    async initOctokitApp(installationId: number) {
        const auth = createAppAuth({
            appId: Number(this.configService.get<string>('GITHUB_APP_ID')),
            privateKey: this.privateKey,
            clientId: this.configService.get<string>('GITHUB_CLIENT_ID'),
            clientSecret: this.configService.get<string>('GITHUB_CLIENT_SECRET')
        })
        const installationAuth = await auth({
            type: 'installation',
            installationId
        })
        return new Octokit({ auth: installationAuth.token })
    }

    async appAuthenticationJWT() {
        const auth = createAppAuth({
            appId: Number(this.configService.get<string>('GITHUB_APP_ID')),
            privateKey: this.privateKey,
            clientId: this.configService.get<string>('GITHUB_CLIENT_ID'),
            clientSecret: this.configService.get<string>('GITHUB_CLIENT_SECRET')
        })
        const { token } = await auth({ type: 'app' })
        return new Octokit({ auth: token })
    }

    // GitHub Pull Request Events
    async handleGitHubPullRequest(payload, event: PREvent) {
        const { action, pull_request, repository, installation } = payload
        return await this.createComprehensivePRAnalysis(
            repository.owner.login,
            repository.name,
            pull_request.number,
            installation?.id,
            event
        )
    }

    async removeInstallationIdFromWorkspace(installationId: number) {
        return this.dataService.workspaces.updateOne(
            { installationId },
            { $set: { installationId: null } }
        )
    }

    async handleGitHubInstallation(payload) {
        const { action, installation } = payload
        switch (action) {
            case 'deleted':
                return await this.removeInstallationIdFromWorkspace(
                    installation.id
                )
        }
    }

    async addPRSummery(analysis: PullRequestAnalysis) {
        const octokit = await this.initOctokitApp(+analysis.installationId)
        await octokit.issues.createComment({
            owner: analysis.workspaceSlug,
            repo: analysis.repositorySlug,
            issue_number: +analysis.prNumber,
            body: analysis.summary
        })
        return {}
    }

    // Fetch PR files and changes
    async fetchPRFiles(owner, repo, prNumber, installationId) {
        const octokit = await this.initOctokitApp(installationId)

        // Use paginate to get ALL files, not just the first 30
        const files = await octokit.paginate(octokit.pulls.listFiles, {
            owner,
            repo,
            pull_number: prNumber,
            per_page: 100 // Fetch 100 files per page for efficiency
        })
        return files
    }

    // Create comprehensive PR analysis with full file contents
    async createComprehensivePRAnalysis(
        owner: string,
        repo: string,
        prNumber: number,
        installationId: number,
        event: PREvent
    ): Promise<StructuredPRData> {
        const octokit = await this.initOctokitApp(installationId)

        const { data: prData } = await octokit.pulls.get({
            owner,
            repo,
            pull_number: prNumber
        })

        // Get changed files
        const files = await this.fetchPRFiles(
            owner,
            repo,
            prNumber,
            installationId
        )

        const prFiles: PRFile[] = []
        const totalPrLineAdditions = files.reduce(
            (sum, file) => sum + (file.additions || 0),
            0
        )
        const totalPrLineDeletion = files.reduce(
            (sum, file) => sum + (file.deletions || 0),
            0
        )
        // Process each file to get before/after content
        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            const contentBefore = await this.fetchFileContent(
                owner,
                repo,
                file.filename,
                prData.base.sha,
                installationId
            )

            // Get file content after PR (head branch)
            const contentAfter = await this.fetchFileContent(
                owner,
                repo,
                file.filename,
                prData.head.sha,
                installationId
            )
            prFiles.push({
                prFileName: file.filename,
                prFileStatus: file.status,
                prFileAdditions: file.additions,
                prFileDeletions: file.deletions,
                prFileChanges: file.changes,
                prFileContentBefore:
                    contentBefore || 'File not found in base branch',
                prFileContentAfter:
                    contentAfter || 'File not found in head branch',
                prFileDiff: file.patch || 'No diff available',
                prFileDiffHunks: this.parseDiffHunks(file.patch || ''),
                prFileBlobUrl: file.blob_url
            })
        }

        // Create the comprehensive structure
        const comprehensiveAnalysis: StructuredPRData = {
            pullRequest: {
                provider: 'github',
                prId: prData.id.toString(),
                prUser: prData.user.login,
                prUserAvatar: prData.user.avatar_url || '',
                prUrl: prData.html_url || '',
                owner: owner,
                repo: repo,
                prNumber: prNumber.toString(),
                installationId: installationId?.toString() || 'not_provided',
                prRepoName: `${owner}/${repo}`,
                prTitle: prData.title,
                prBody: prData.body || '',
                prState: mapPREventToState(event),
                prCreatedAt: prData.created_at,
                prUpdatedAt: prData.updated_at,
                prClosedAt: prData.closed_at || '',
                prMergedAt: prData.merged_at || '',
                prHeadBranch: prData.head.ref,
                prBaseBranch: prData.base.ref,
                prHeadSha: prData.head.sha,
                prBaseSha: prData.base.sha,
                prFilesChanged: files.length,
                prTotalLineAddition: totalPrLineAdditions,
                prTotalLineDeletion: totalPrLineDeletion,
                prFiles: prFiles
            }
        }
        return comprehensiveAnalysis
    }

    // Add review comments to specific lines in PR files
    async addPRReviewComments(
        analysis: PullRequestAnalysis,
        comments: PullRequestAnalysisComment[]
    ) {
        const commentsFormatted = comments.map((comment) => ({
            path: comment.filePath,
            line: comment.lineEnd,
            body: comment.content
        }))
        const octokit = await this.initOctokitApp(+analysis.installationId)
        const reviewData: any = {
            owner: analysis.workspaceSlug,
            repo: analysis.repositorySlug,
            pull_number: analysis.prNumber,
            body: '🤖 **Automated Code Review by Pullsight-AI**',
            event: 'COMMENT',
            comments: commentsFormatted
        }

        await octokit.pulls.createReview(reviewData)
        return {}
    }

    // Fetch full file content from GitHub repository
    async fetchFileContent(owner, repo, filePath, sha, installationId) {
        try {
            const octokit = await this.initOctokitApp(installationId)
            const { data } = await octokit.repos.getContent({
                owner,
                repo,
                path: filePath,
                ref: sha
            })

            // Decode base64 content
            if (data['content']) {
                return Buffer.from(data['content'], 'base64').toString('utf8')
            }
            return null
        } catch (error) {
            return null
        }
    }

    // Parse diff into structured hunks
    private parseDiffHunks(diff: string): string[] {
        if (!diff) return []

        const hunks: string[] = []
        const hunkRegex = /@@[^@]*@@.*?(?=@@|$)/gs

        let match
        while ((match = hunkRegex.exec(diff)) !== null) {
            hunks.push(match[0])
        }

        return hunks
    }
}
