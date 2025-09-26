import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AnalysisService } from 'src/analysis/analysis.service'
import { BitbucketService } from 'src/bitbucket/bitbucket.service'
import { PaginateDto } from 'src/common/dto/paginate.dto'
import { DatabaseService } from 'src/database/database.service'
import { MemberRole } from 'src/database/schemas/workspace-members.schema'
import { CreateAndUpdateWorkspaceSettingsDto } from 'src/workspace/dto/create-update-workspace-settings.dto'
import { MakeSubscriptionDto } from 'src/workspace/dto/make-subscription.dto'
import { UpdateMemberDto } from 'src/workspace/dto/update-member.dto'
import { UpdateRepositoryDto } from 'src/workspace/dto/update-repository.dto'
import {
    CreateMembersDto,
    CreateRepositoryDto
} from './dto/create-repository.dto'

@Injectable()
export class WorkspaceService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly analysisService: AnalysisService,
        private readonly bitbucketService: BitbucketService
    ) {}

    async createAndUpdateWorkspaceSettings(
        user: any,
        createAndUpdateWorkspaceSettingsDto: CreateAndUpdateWorkspaceSettingsDto
    ) {
        // Find the user's current workspace
        const userData = await this.dataService.users.findOne({
            _id: user.sub,
            provider: user.provider
        })

        const userWorkspace = await this.dataService.workspaces.findOne({
            _id: userData?.currentWorkspace
        })

        if (!userWorkspace) {
            throw new Error('Workspace not found')
        }

        // Update only the WorkspaceSetting subdocument
        await this.dataService.workspaces.updateOne(
            { _id: userWorkspace._id },
            { $set: { workspaceSetting: createAndUpdateWorkspaceSettingsDto } }
        )

        // Return the updated workspace settings
        const updatedWorkspace = await this.dataService.workspaces.findOne({
            _id: userWorkspace._id
        })

        return updatedWorkspace
    }

    async findAllWorkspaceTeamMember(
        user: any,
        paginate: PaginateDto,
        filter: any
    ) {
        const userData =
            await this.analysisService.getUserDataWithWorkspace(user)

        if (!userData?.currentWorkspace) {
            throw new BadRequestException('No active workspace found for user')
        }

        // Build query filter
        const query: any = { workspace: userData.currentWorkspace._id }
        if (filter?.role) {
            query.role = filter.role
        }
        if (filter?.isActive !== undefined) {
            query.isActive = filter.isActive === 'true' ? true : false
        }

        // Paginate results
        return await this.dataService.workspaceMembers.paginate(query, {
            ...paginate
        })
    }

    async setWebhook(userData, repository) {
        let repositoryData
        switch (userData?.provider) {
            case 'github':
                repositoryData = repository
                break
            case 'bitbucket':
                repositoryData = await this.bitbucketService.addWebhook(
                    userData,
                    repository
                )
                break
            default:
                throw new Error('Unsupported provider')
        }
        return repositoryData
    }
    async makeSubscription(
        makeSubscriptionDto: MakeSubscriptionDto,
        user: any
    ) {
        const userData: any =
            await this.analysisService.getUserDataWithWorkspace(user)
        let repositories = makeSubscriptionDto.repositories

        // update workspace onboarding step
        await this.dataService.workspaces.updateOne(
            { _id: userData?.currentWorkspace!._id },
            { $set: { onboardingStep: 0 } }
        )

        Promise.all(
            repositories.map(async (repository) => {
                let repositoryData =
                    await this.dataService.repositories.findOne({
                        id: repository['id'],
                        provider: userData.provider,
                        workspace: userData?.currentWorkspace!._id
                    })

                if (!repositoryData) {
                    repository = await this.setWebhook(userData, repository)
                    await this.dataService.repositories.create({
                        ...repository,
                        provider: userData.provider,
                        workspace: userData?.currentWorkspace!._id,
                        isActive: true
                    })
                } else {
                    if (!repositoryData.webhookToken) {
                        repository = await this.setWebhook(userData, repository)
                    }
                    await this.dataService.repositories.updateOne(
                        { _id: repositoryData['_id'] },
                        {
                            $set: {
                                ...repository,
                                isActive: true
                            }
                        }
                    )
                }
            })
        )

        Promise.all(
            makeSubscriptionDto.members.map(async (member) => {
                const user = await this.dataService.workspaceMembers.findOne({
                    providerId: member.providerId,
                    provider: userData.provider,
                    workspace: userData?.currentWorkspace!._id
                })
                if (!user) {
                    await this.dataService.workspaceMembers.create({
                        providerId: member.providerId,
                        provider: userData.provider,
                        username: member.username,
                        role:
                            userData.providerId == member.providerId
                                ? MemberRole.OWNER
                                : MemberRole.MEMBER,
                        user:
                            userData.providerId == member.providerId
                                ? userData._id
                                : null,
                        joinedAt:
                            userData.providerId == member.providerId
                                ? new Date()
                                : null,
                        workspace: userData?.currentWorkspace!._id,
                        isActive: true,
                        invitedAt: new Date()
                    })
                } else {
                    await this.dataService.workspaceMembers.updateOne(
                        { _id: user._id },
                        {
                            $set: {
                                role:
                                    userData.providerId == member.providerId
                                        ? MemberRole.OWNER
                                        : MemberRole.MEMBER,
                                isActive: true,
                                invitedAt: new Date()
                            }
                        }
                    )
                }
            })
        )

        userData.currentWorkspace.noOfActiveMembers =
            makeSubscriptionDto.members.length
        await userData.currentWorkspace.save()
        return {}
    }

    async addMembers(createMembersDto: CreateMembersDto, user: any) {
        const userData: any =
            await this.analysisService.getUserDataWithWorkspace(user)

        await Promise.all(
            createMembersDto.members.map(async (member) => {
                const user = await this.dataService.workspaceMembers.findOne({
                    providerId: member.providerId,
                    provider: userData.provider,
                    workspace: userData?.currentWorkspace!._id
                })
                if (!user) {
                    await this.dataService.workspaceMembers.create({
                        providerId: member.providerId,
                        provider: userData.provider,
                        username: member.username,
                        role:
                            userData.providerId == member.providerId
                                ? MemberRole.OWNER
                                : MemberRole.MEMBER,
                        user:
                            userData.providerId == member.providerId
                                ? userData._id
                                : null,
                        workspace: userData?.currentWorkspace!._id,
                        isActive: member.isActive
                    })
                } else {
                    await this.dataService.workspaceMembers.updateOne(
                        { _id: user._id },
                        {
                            $set: {
                                role:
                                    userData.providerId == member.providerId
                                        ? MemberRole.OWNER
                                        : MemberRole.MEMBER,
                                isActive: member.isActive
                            }
                        }
                    )
                }
            })
        )
        userData.currentWorkspace.noOfActiveMembers =
            await this.dataService.workspaceMembers.countDocuments({
                provider: userData.provider,
                workspace: userData?.currentWorkspace!._id,
                isActive: true
            })
        await userData.currentWorkspace.save()
        return {}
    }

    async createRepository(
        createRepositoryDto: CreateRepositoryDto,
        user: any
    ) {
        const userData =
            await this.analysisService.getUserDataWithWorkspace(user)
        let repositories = createRepositoryDto.repositories

        Promise.all(
            repositories.map(async (repository) => {
                let repositoryData =
                    await this.dataService.repositories.findOne({
                        id: repository['id'],
                        provider: userData.provider,
                        workspace: userData?.currentWorkspace!._id
                    })

                if (!repositoryData) {
                    repository = await this.setWebhook(userData, repository)
                    await this.dataService.repositories.create({
                        ...repository,
                        provider: userData.provider,
                        workspace: userData?.currentWorkspace!._id,
                        isActive: true
                    })
                } else {
                    if (!repositoryData.webhookToken) {
                        repository = await this.setWebhook(userData, repository)
                    }
                    await this.dataService.repositories.updateOne(
                        { _id: repositoryData['_id'] },
                        {
                            $set: {
                                ...repository,
                                isActive: true
                            }
                        }
                    )
                }
            })
        )
        return {}
    }

    async findAllRepositories(user: any, query: any) {
        const { page, limit } = query
        const filter = {}
        if (query.isActive) {
            filter['isActive'] = query.isActive === 'true' ? true : false
        }
        if (query.author) {
            filter['author.username'] = query.author
        }
        const userData =
            await this.analysisService.getUserDataWithWorkspace(user)
        return this.dataService.repositories.paginate(
            {
                workspace: userData?.currentWorkspace!._id,
                ...filter
            },
            { page, limit, sort: { _id: -1 } }
        )
    }

    async updateRepository(id: string, body: UpdateRepositoryDto, user) {
        await this.dataService.repositories.updateOne(
            { _id: id },
            { $set: { ...body } }
        )
        const repository = await this.dataService.repositories
            .findOne({
                _id: id
            })
            .populate('workspace')
        if (body.isActive === false) {
            const accessToken = await this.dataService.users.findOne(
                { _id: user.sub, provider: user.provider },
                'accessToken'
            )
            if (repository && accessToken) {
                await this.deleteWebhook(repository, accessToken.accessToken)
            }
        }
        if (body.isActive === true) {
            const userData = await this.dataService.users
                .findOne(
                    { _id: user.sub, provider: user.provider },
                    'accessToken currentWorkspace provider'
                )
                .populate('currentWorkspace')
            if (repository && userData) {
                const webhookData = await this.setWebhook(userData, repository)
                repository.webhookToken = webhookData.webhookToken
                await repository.save()
            }
        }
        return repository
    }

    async updateMember(id: string, body: UpdateMemberDto, user) {
        await this.dataService.workspaceMembers.updateOne(
            { _id: id },
            { $set: { ...body } }
        )
        return {}
    }

    async deleteWebhook(repository: any, accessToken: any) {
        try {
            switch (repository.provider) {
                case 'bitbucket':
                    await this.bitbucketService.removeWebhook(
                        accessToken,
                        repository.workspace.slug,
                        repository.slug,
                        repository.webhookToken
                    )
                    break
            }
        } catch (err) {
            console.log('Error removing webhook:', err)
        }
        await this.dataService.repositories.updateOne(
            { _id: repository._id },
            { $set: { webhookToken: null } }
        )
    }

    async findPRs(user: any, query: any) {
        const { page, limit, ...filter } = query
        const userData =
            await this.analysisService.getUserDataWithWorkspace(user)

        // Calculate date 30 days ago
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        return this.dataService.pullRequests.paginate(
            {
                owner: userData?.currentWorkspace!['slug'],
                provider: userData?.provider,
                // createdAt: {
                //     $gte: thirtyDaysAgo
                // },
                ...filter
            },
            {
                populate: {
                    path: 'pullRequestAnalysis',
                    select: 'usageInfo prReviewUsageInfo'
                },
                page,
                limit,
                sort: { _id: -1 },
                select: 'provider prTitle prUser prUserAvatar owner repo prNumber prUrl prId prCreatedAt prUpdatedAt  prMergedAt prState issueCount prTotalLineAddition prTotalLineDeletion'
            }
        )
    }
}
