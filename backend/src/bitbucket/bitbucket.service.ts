import {
    BadRequestException,
    Injectable,
    InternalServerErrorException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AnalysisService } from 'src/analysis/analysis.service'
import { BitbucketEventsService } from 'src/bitbucket/bitbucket-events.service'
import { AddWorkspaceDto } from 'src/common/dto/add-workspace.dto'
import { PaginateDto } from 'src/common/dto/paginate.dto'
import { PREvent, PRState } from 'src/common/enums/pr.enum'
import { HttpService } from 'src/common/http/http.service'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import { Repository } from 'src/common/interfaces/repository.interface'
import { DatabaseService } from 'src/database/database.service'
import { Workspace } from 'src/database/schemas/workspace.schema'
import { GetPRDto, PRReviewDto } from 'src/github/dto/install-repo.dto'
import { RepositoryDto } from 'src/workspace/dto/make-subscription.dto'
import { BitbucketApiService } from './bitbucket-api.service'

@Injectable()
export class BitbucketService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly bitbucketApiService: BitbucketApiService,
        private readonly httpService: HttpService,
        private readonly bitbucketEventsService: BitbucketEventsService,
        private readonly analysisService: AnalysisService
    ) {}

    async getAllWorkspaces(user: any): Promise<Workspace[]> {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken _id workspaces currentWorkspace'
        )
        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }
        return await this.bitbucketApiService.getAllWorkspaces(
            userData?.accessToken
        )
    }

    async addWorkspace(
        user: any,
        addWorkspaceDto: AddWorkspaceDto
    ): Promise<Workspace> {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken _id'
        )

        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        const workspace = await this.bitbucketApiService.getSingleWorkspace(
            userData?.accessToken,
            addWorkspaceDto.slug
        )

        let existingWorkspace = await this.dataService.workspaces.findOne({
            id: workspace.id,
            slug: workspace.slug,
            provider: 'bitbucket'
        })

        if (!existingWorkspace) {
            existingWorkspace = await this.dataService.workspaces.create({
                ...workspace,
                ownerId: userData._id
            })
        }

        if (!existingWorkspace) {
            throw new InternalServerErrorException(
                'Failed to create or update workspace'
            )
        }

        await this.dataService.users.updateOne(
            { _id: userData._id },
            {
                $set: {
                    currentWorkspace: existingWorkspace._id
                },
                $addToSet: {
                    workspaces: existingWorkspace._id
                }
            }
        )
        return existingWorkspace
    }

    async getWorkspaceRepositories(
        user: any,
        filter?: string
    ): Promise<Repository[]> {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (!userData || !userData?.currentWorkspace) {
            throw new Error(
                'User or current workspace not found or installation ID missing'
            )
        }

        const allRepositories =
            await this.bitbucketApiService.getWorkspaceRepositories(
                userData.accessToken as string,
                userData?.currentWorkspace['slug'] as string
            )

        // Filter repositories based on the filter parameter
        if (filter === 'available') {
            // Get repositories that are already added to the current workspace
            const addedRepos = await this.dataService.repositories.find({
                workspace: userData.currentWorkspace['_id'],
                provider: 'bitbucket'
            })

            // Get the repository IDs that are already added
            const addedRepoIds = addedRepos.map((repo) => repo.id.toString())

            // Filter out repositories that are already added
            return allRepositories.filter(
                (repo) => !addedRepoIds.includes(repo.id.toString())
            )
        }

        return allRepositories
    }

    async listOrganizationSpecificRepositories(
        user: any,
        paginate: PaginateDto
    ) {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub, provider: user.provider })
            .populate('currentWorkspace')
        if (!userData || !userData?.currentWorkspace) {
            throw new Error('User or current workspace not found')
        }

        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        const workspace = await this.dataService.workspaces
            .findOne({ _id: userData.currentWorkspace })
            .select('slug')
            .lean()

        if (!workspace) {
            throw new BadRequestException('Workspace not found')
        }

        const repositories =
            await this.bitbucketApiService.getWorkspaceRepositoriesPaginated(
                userData.accessToken,
                workspace.slug,
                paginate
            )
        const { page, pagelen } = repositories
        return {
            repositories: repositories.values || [],
            pagination: {
                page: page || paginate.page,
                perPage: pagelen || paginate.limit,
                totalCount: repositories.size || null,
                hasNext: !!repositories.next
            }
        }
    }

    async addWebhook(userData: any, repository: RepositoryDto): Promise<any> {
        const webhookUrl = `${this.configService.get('BASE_URL')}/v1/bitbucket/events`
        const events = [
            'repo:push',
            'pullrequest:created',
            'pullrequest:updated',
            'pullrequest:approved',
            'pullrequest:unapproved',
            'pullrequest:fulfilled',
            'pullrequest:rejected',
            'issue:created',
            'issue:updated',
            'issue:comment_created'
        ]
        const response = await this.bitbucketApiService.addWebhook(
            userData?.accessToken as string,
            userData?.currentWorkspace['slug'] as string,
            repository.slug,
            webhookUrl,
            events
        )
        return {
            ...repository,
            webhookToken: response.webhook.id
        }
    }

    async getPullRequests(user: any, getPRDto: GetPRDto) {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (!userData || !userData?.currentWorkspace) {
            throw new Error(
                'User or current workspace not found or installation ID missing'
            )
        }

        return await this.bitbucketApiService.getPullRequests(
            userData.accessToken as string,
            userData?.currentWorkspace['slug'] as string,
            getPRDto.repo,
            getPRDto.status,
            +getPRDto.limit
        )
    }

    async processBitbucketEvent(event: any, payload: any) {
        let isApplicable
        let pullRequestFormattedData: StructuredPRData | boolean
        let prEvent
        switch (event) {
            case 'pullrequest:created':
                isApplicable =
                    await this.analysisService.checkApplicableForAnalysis(
                        payload.repository.full_name.split('/')[1],
                        payload.repository.owner.username,
                        'bitbucket',
                        payload.actor.uuid
                    )
                if (!isApplicable) {
                    return {}
                }
                prEvent = PREvent.CREATED
                pullRequestFormattedData =
                    await this.bitbucketEventsService.handleBitbucketPullRequest(
                        payload,
                        prEvent
                    )
                break
            case 'pullrequest:updated':
                isApplicable =
                    await this.analysisService.checkApplicableForAnalysis(
                        payload.repository.full_name.split('/')[1],
                        payload.repository.owner.username,
                        'bitbucket',
                        payload.actor.uuid
                    )
                if (!isApplicable) {
                    return {}
                }
                prEvent = PREvent.UPDATED
                pullRequestFormattedData =
                    await this.bitbucketEventsService.handleBitbucketPullRequest(
                        payload,
                        prEvent
                    )
                break
            case 'pullrequest:fulfilled':
                await this.analysisService.updatedPRState(
                    {
                        repo:
                            payload.repository.slug || payload.repository.name,
                        prNumber: payload.pullrequest?.id.toString(),
                        owner:
                            payload.repository.workspace?.slug ||
                            payload.repository.full_name?.split('/')[0],
                        provider: 'bitbucket'
                    },
                    { prState: PRState.MERGED }
                )
                pullRequestFormattedData = false
                break
            case 'pullrequest:rejected':
                await this.analysisService.updatedPRState(
                    {
                        repo:
                            payload.repository.slug || payload.repository.name,
                        prNumber: payload?.pullrequest?.id.toString(),
                        owner:
                            payload.repository.workspace?.slug ||
                            payload.repository.full_name?.split('/')[0],
                        provider: 'bitbucket'
                    },
                    { prState: PRState.DECLINED }
                )
                pullRequestFormattedData = false
                break
            default:
                pullRequestFormattedData = false
        }

        if (pullRequestFormattedData) {
            this.analysisService.makeAnalysis(
                pullRequestFormattedData,
                prEvent,
                isApplicable.workspaceMember.workspace,
                isApplicable.repository
            )
        }
        return {}
    }

    async makePRReview(user: any, prReviewDto: PRReviewDto) {
        const existingAnalysis =
            await this.analysisService.getExistingPullRequestAndAnalysis(
                prReviewDto,
                'bitbucket'
            )
        if (existingAnalysis) {
            return existingAnalysis
        }
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')

        if (!userData || !userData?.currentWorkspace) {
            throw new BadRequestException(
                'User or current workspace not found or installation ID missing'
            )
        }
        const PrAndRepo = await this.bitbucketApiService.getBitbucketPRAndRepo(
            userData.accessToken as string,
            userData?.currentWorkspace['slug'] as string,
            prReviewDto.repo,
            +prReviewDto.prNumber
        )
        const pullRequestFormattedData =
            await this.bitbucketEventsService.handleBitbucketPullRequest(
                PrAndRepo,
                PREvent.CREATED
            )

        if (!pullRequestFormattedData) {
            throw new InternalServerErrorException(
                'Failed to fetch pull request data'
            )
        }
        return await this.analysisService.makeAnalysis(
            pullRequestFormattedData,
            PREvent.CREATED,
            userData.currentWorkspace._id
        )
    }

    async getOrgMembers(user: any, query: any) {
        const userData =
            await this.analysisService.getUserDataWithWorkspace(user)

        const members = await this.bitbucketApiService.getOrgMembers(
            userData.accessToken as string,
            userData?.currentWorkspace!['slug'] as string
        )

        const savedMembers = await this.dataService.workspaceMembers.find({
            workspace: userData.currentWorkspace?._id
        })

        // Create a Map for O(1) lookup instead of O(n) for each member
        const savedMembersMap = new Map(
            savedMembers.map((saved: any) => [saved.providerId, saved])
        )

        // Update member list with saved member information
        const updatedMembers = members.map((member: any) => {
            const savedMember = savedMembersMap.get(member.providerId)

            // Remove the member from map after getting the data
            if (savedMember) {
                savedMembersMap.delete(member.providerId)
            }

            return {
                ...member,
                _id: savedMember?._id ?? null,
                role: savedMember?.role
                    ? savedMember.role
                    : userData.providerId == member.providerId
                      ? 'owner'
                      : 'member',
                isActive: Boolean(savedMember?.isActive),
                joinedAt: savedMember?.joinedAt
            }
        })

        // Set isActive to false for remaining members in savedMembersMap
        // These are members that exist in database but not in the current API response
        if (savedMembersMap.size > 0) {
            const remainingMemberIds = Array.from(savedMembersMap.values()).map(
                (member) => member._id
            )
            await this.dataService.workspaceMembers.updateMany(
                { _id: { $in: remainingMemberIds } },
                { $set: { isActive: false } }
            )
        }

        // Apply filter if requested
        if (query.isActive !== undefined) {
            const isActiveFilter = query.isActive === 'true'
            return updatedMembers.filter(
                (member) => member.isActive === isActiveFilter
            )
        }

        return updatedMembers
    }

    async removeWebhook(
        accessToken: string,
        workspaceSlug: string,
        repoSlug: string,
        webhookId: string
    ) {
        return await this.bitbucketApiService.removeWebhook(
            accessToken,
            workspaceSlug,
            repoSlug,
            webhookId
        )
    }
}
