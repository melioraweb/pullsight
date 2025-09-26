import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Types } from 'mongoose'
import { PullRequestAnalysisCommentsDto } from 'src/analysis/dto/post-analysis-comments.dto'
import { PullRequestAnalysisDto } from 'src/analysis/dto/post-analysis.dto'
import { BitbucketEventsService } from 'src/bitbucket/bitbucket-events.service'
import { PREvent } from 'src/common/enums/pr.enum'
import { HttpService } from 'src/common/http/http.service'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import { DatabaseService } from 'src/database/database.service'
import { Status } from 'src/database/schemas/pull-request-analysis.schema'
import { PRReviewDto } from 'src/github/dto/install-repo.dto'
import { GithubEventService } from 'src/github/github-events.service'

@Injectable()
export class AnalysisService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly githubEventService: GithubEventService,
        private readonly bitbucketEventsService: BitbucketEventsService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {}

    async getUserDataWithWorkspace(user: any) {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (!userData || !userData?.currentWorkspace) {
            throw new Error('User or current workspace not found')
        }
        return userData
    }

    async checkApplicableForAnalysis(
        repositorySlug: string,
        workspaceSlug: string,
        provider: string,
        providerId: string
    ) {
        const repository = await this.dataService.repositories
            .findOne({
                slug: repositorySlug,
                'author.username': workspaceSlug,
                provider: provider,
                isActive: true
            })
            .populate('workspace')
        if (!repository) {
            return false
        }
        const workspaceMember = await this.dataService.workspaceMembers.findOne(
            {
                provider: provider,
                providerId: providerId,
                workspace: repository.workspace!['_id'],
                isActive: true
            }
        )
        if (!workspaceMember) {
            return false
        }
        return {
            repository,
            workspaceMember
        }
    }

    async getAndSavePullRequestFormattedData(
        pullRequestFormattedData: StructuredPRData,
        event: PREvent
    ) {
        if (event == PREvent.UPDATED) {
            const newPR = pullRequestFormattedData.pullRequest
            const existingPR = await this.dataService.pullRequests.findOne({
                provider: newPR.provider,
                prNumber: newPR.prNumber,
                owner: newPR.owner,
                repo: newPR.repo
            })
            if (!existingPR) {
                const pullRequest = await this.dataService.pullRequests.create({
                    ...pullRequestFormattedData.pullRequest
                })
                return pullRequest?.toObject()
            }
            const prFiles = newPR.prFiles
                .map((file) => {
                    if (!existingPR?.prFiles) return file // If no existing files, include all new files

                    // Check if file doesn't exist in existing PR
                    const existingFile = existingPR.prFiles.find(
                        (f) => f.prFileName === file.prFileName
                    )

                    if (!existingFile) return file // New file - return with all hunks

                    // Compare prFileDiffHunks and filter only changed/added hunks
                    const existingHunks = existingFile.prFileDiffHunks || []
                    const newHunks = file.prFileDiffHunks || []

                    // Find hunks that are new or changed
                    const changedHunks = newHunks.filter(
                        (newHunk) => !existingHunks.includes(newHunk)
                    )

                    // If there are changed hunks, return file with only changed hunks
                    if (changedHunks.length > 0) {
                        return {
                            ...file,
                            prFileDiffHunks: changedHunks
                        }
                    }

                    // No changes in hunks, exclude this file
                    return null
                })
                .filter((file) => file !== null) // Remove null entries

            const savedPullRequestFormattedData =
                await this.dataService.pullRequests.findOneAndUpdate(
                    {
                        _id: existingPR._id
                    },
                    {
                        $set: {
                            ...newPR
                        }
                    },
                    { new: true }
                )

            return {
                ...(savedPullRequestFormattedData?.toObject() || {}),
                prFiles: prFiles
            }
        }
        const pullRequest = await this.dataService.pullRequests.create({
            ...pullRequestFormattedData.pullRequest
        })
        return pullRequest?.toObject()
    }

    async updatedPRState(query: any, data: any) {
        return await this.dataService.pullRequests.updateOne(query, {
            $set: data
        })
    }

    async makeAnalysis(
        pullRequestFormattedData: StructuredPRData,
        event: PREvent,
        workspace: any,
        repository?: any
    ) {
        const savedPullRequestFormattedData =
            await this.getAndSavePullRequestFormattedData(
                pullRequestFormattedData,
                event
            )
        const pullRequestAnalysis =
            await this.dataService.pullRequestAnalysis.create({
                prId: savedPullRequestFormattedData.prId,
                provider: savedPullRequestFormattedData.provider,
                prUser: savedPullRequestFormattedData.prUser,
                workspaceSlug: savedPullRequestFormattedData.owner,
                repositorySlug: savedPullRequestFormattedData.repo,
                prNumber: savedPullRequestFormattedData.prNumber,
                installationId: savedPullRequestFormattedData.installationId,
                prState: savedPullRequestFormattedData.prState,
                status: Status.INPROGRESS,
                startedAt: new Date(),
                pullRequest: savedPullRequestFormattedData._id,
                workspace
            })
        await this.dataService.pullRequests.updateOne(
            { _id: savedPullRequestFormattedData._id },
            {
                $addToSet: {
                    pullRequestAnalysis: pullRequestAnalysis[
                        '_id'
                    ] as Types.ObjectId
                }
            }
        )
        try {
            const requestBody = {
                pullRequest: {
                    ...savedPullRequestFormattedData,
                    pullRequestAnalysisId: pullRequestAnalysis['_id'],
                    apiKey: repository?.workspace?.workspaceSetting?.apiKey,
                    modelName:
                        repository?.workspace?.workspaceSetting?.modelName,
                    minSeverity: repository?.minSeverity,
                    ignore: repository?.ignore
                }
            }

            await this.httpService.post(
                this.configService.get('AI_AGENT_PR_POST_URL') as string,
                requestBody,
                {
                    timeout: 1000 // 1 second timeout
                }
            )
        } catch (error) {
            console.error('Error sending data to AI agent:', error.message)
        }
        return {
            pullRequestAnalysisId: pullRequestAnalysis['_id'],
            pullRequest: savedPullRequestFormattedData
        }
    }

    async addPRReviewComments(postReviewDto: PullRequestAnalysisCommentsDto) {
        let analysis
        if (postReviewDto.completed) {
            analysis =
                await this.dataService.pullRequestAnalysis.findOneAndUpdate(
                    {
                        _id: postReviewDto.pullRequestAnalysisId
                    },
                    {
                        $set: {
                            status: Status.COMPLETED,
                            completedAt: new Date(),
                            prReviewModelInfo: postReviewDto.modelInfo,
                            prReviewUsageInfo: postReviewDto.usageInfo
                        }
                    },
                    { new: true }
                )
        } else {
            analysis = await this.dataService.pullRequestAnalysis.findOne({
                _id: postReviewDto.pullRequestAnalysisId
            })
        }

        if (!analysis) {
            throw new Error('Pull request analysis not found')
        }

        // Create all comments in parallel
        const createdComments = await Promise.all(
            postReviewDto.comments.map(async (comment) => {
                return await this.dataService.pullRequestAnalysisComments.create(
                    {
                        ...comment,
                        pullRequestAnalysisId:
                            Types.ObjectId.createFromHexString(
                                postReviewDto.pullRequestAnalysisId
                            ),
                        repositorySlug: analysis.repositorySlug,
                        pullRequest: analysis.pullRequest,
                        workspace: analysis.workspace
                    }
                )
            })
        )

        switch (analysis.provider) {
            case 'github':
                await this.githubEventService.addPRReviewComments(
                    analysis,
                    createdComments
                )
                break
            case 'bitbucket':
                await this.bitbucketEventsService.addPRReviewComments(
                    analysis,
                    createdComments
                )
                break
            default:
                throw new Error('Unsupported provider')
        }

        if (postReviewDto.completed) {
            const issueCount =
                await this.dataService.pullRequestAnalysisComments.countDocuments(
                    {
                        pullRequest: analysis.pullRequest
                    }
                )
            if (issueCount) {
                await this.dataService.pullRequests.updateOne(
                    { _id: analysis.pullRequest },
                    { $set: { issueCount: issueCount } }
                )
            }
        }
        return {}
    }

    async addPRSummery(postSummery: PullRequestAnalysisDto) {
        const updateBody: any = {
            summary: postSummery.summary,
            modelInfo: postSummery.modelInfo,
            usageInfo: postSummery.usageInfo,
            estimatedCodeReviewEffort:
                postSummery?.summary_info?.estimated_code_review_time,
            potentialIssueCount:
                postSummery?.summary_info?.potential_issue_count
        }
        if (!postSummery.summary) {
            updateBody.status = Status.COMPLETED
            updateBody.completedAt = new Date()
        }
        const analysis =
            await this.dataService.pullRequestAnalysis.findOneAndUpdate(
                {
                    _id: postSummery.pullRequestAnalysisId
                },
                {
                    $set: updateBody
                },
                { new: true }
            )

        if (!analysis) {
            throw new Error('Pull request analysis not found')
        }
        if (postSummery.summary) {
            switch (analysis.provider) {
                case 'github':
                    await this.githubEventService.addPRSummery(analysis)
                    break
                case 'bitbucket':
                    await this.bitbucketEventsService.addPRSummery(analysis)
                    break
                default:
                    throw new Error('Unsupported provider')
            }
        }
        return {}
    }

    async getExistingPullRequestAndAnalysis(
        prReviewDto: PRReviewDto,
        provider: string
    ) {
        const pullRequestAnalysis =
            await this.dataService.pullRequestAnalysis.findOne({
                repositorySlug: prReviewDto.repo,
                prNumber: prReviewDto.prNumber,
                provider: provider
            })
        if (!pullRequestAnalysis) {
            return false
        }
        return {
            pullRequestAnalysisId: pullRequestAnalysis['_id'],
            pullRequest: await this.dataService.pullRequests.findOne({
                _id: pullRequestAnalysis.pullRequest
            }),
            pullRequestAnalysis: {
                ...pullRequestAnalysis.toObject(),
                comments:
                    await this.dataService.pullRequestAnalysisComments.find({
                        pullRequestAnalysisId: pullRequestAnalysis['_id']
                    })
            }
        }
    }

    async getPRAnalysisData(pullRequestAnalysisId: string) {
        const analysis = await this.dataService.pullRequestAnalysis.findOne({
            _id: pullRequestAnalysisId
        })
        if (!analysis) {
            throw new Error('Pull request analysis not found')
        }
        return {
            ...analysis.toObject(),
            comments: await this.dataService.pullRequestAnalysisComments.find({
                pullRequestAnalysisId: Types.ObjectId.createFromHexString(
                    pullRequestAnalysisId
                )
            })
        }
    }
}
