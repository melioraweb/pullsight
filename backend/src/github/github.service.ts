import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Octokit } from '@octokit/rest'
import { AnalysisService } from 'src/analysis/analysis.service'
import { PaginateDto } from 'src/common/dto/paginate.dto'
import { PREvent, PRState } from 'src/common/enums/pr.enum'
import { HttpService } from 'src/common/http/http.service'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import {
    PullRequestResponse,
    Repository
} from 'src/common/interfaces/repository.interface'
import { DatabaseService } from 'src/database/database.service'
import {
    GetPRDto,
    InstallCallbackDto,
    InstallRepoDto,
    PRReviewDto
} from 'src/github/dto/install-repo.dto'
import { GithubEventService } from 'src/github/github-events.service'

@Injectable()
export class GithubService {
    private octokit: Octokit

    constructor(
        private readonly dataService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly githubEventService: GithubEventService,
        private readonly httpService: HttpService,
        private readonly analysisService: AnalysisService
    ) {}

    async getUserOrganizations(user: any) {
        const data = await this.dataService.users
            .findOne({
                _id: user.sub
            })
            .populate({
                path: 'workspaces',
                match: {
                    installationId: {
                        $exists: true,
                        $nin: [null, '', undefined]
                    }
                }
            })
        return data?.workspaces || []
    }

    async createWorkspace(user: any, installRepoDto: InstallRepoDto) {
        await this.initOctokit(user)
        let workspace = await this.dataService.workspaces.findOne({
            id: installRepoDto.id,
            provider: 'github'
        })
        if (!workspace) {
            let org
            if (installRepoDto.type === 'User') {
                const userData =
                    await this.octokit.rest.users.getAuthenticated()
                org = userData.data
            } else {
                const orgData = await this.octokit.rest.orgs.get({
                    org: installRepoDto.name
                })
                org = orgData.data
            }

            workspace = await this.dataService.workspaces.create({
                id: org.id.toString(),
                name: org.login,
                slug: org.login,
                nodeId: org.node_id,
                url: org.url,
                reposUrl: org.repos_url,
                avatarUrl: org.avatar_url,
                type: org.type,
                provider: 'github',
                ownerId: user.sub,
                createdOn: org.created_at
            })
        }
        await this.dataService.users.updateOne(
            { _id: user.sub },
            {
                $set: {
                    currentWorkspace: workspace._id
                }
            }
        )
        return workspace
    }
    async initOctokit(user: any) {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken'
        )
        if (!userData || !userData.accessToken) {
            throw new Error('User not found or access token missing')
        }
        this.octokit = new Octokit({
            auth: userData.accessToken
        })
        return this.octokit
    }

    async validateAndGetInstalledOrg(installationId: number) {
        const octokit = await this.githubEventService.appAuthenticationJWT()
        const { data } = await octokit.rest.apps.getInstallation({
            installation_id: installationId
        })
        return data.account
    }

    async addInstallOrg(installCallbackDto: InstallCallbackDto) {
        const org: any = await this.validateAndGetInstalledOrg(
            +installCallbackDto.installation_id
        )
        let workspace = await this.dataService.workspaces.findOne({
            id: org.id.toString(),
            provider: 'github'
        })
        if (workspace) {
            const updatedWorkspace =
                await this.dataService.workspaces.findOneAndUpdate(
                    { _id: workspace._id },
                    {
                        $set: {
                            installationId: installCallbackDto.installation_id
                        }
                    },
                    { new: true }
                )
            workspace = updatedWorkspace
        } else {
            workspace = await this.dataService.workspaces.create({
                id: org.id.toString(),
                name: org.login,
                slug: org.login,
                nodeId: org.node_id,
                url: org.url,
                reposUrl: org.repos_url,
                avatarUrl: org.avatar_url,
                type: org.type,
                provider: 'github',
                ownerId: installCallbackDto.state,
                installationId: installCallbackDto.installation_id,
                createdOn: org.created_at,
                isPrivate: org.private
            })
        }

        if (!workspace) {
            throw new InternalServerErrorException(
                'Failed to create or update workspace'
            )
        }

        await this.dataService.users.updateOne(
            { _id: installCallbackDto.state },
            {
                $set: {
                    currentWorkspace: workspace._id
                },
                $addToSet: {
                    workspaces: workspace._id
                }
            }
        )
        return workspace.name
    }

    async listRepoPullRequests(user: any, getPRDto: GetPRDto) {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (
            !userData ||
            !userData?.currentWorkspace ||
            !userData?.currentWorkspace['installationId']
        ) {
            throw new Error(
                'User or current workspace not found or installation ID missing'
            )
        }
        const octokit = await this.githubEventService.initOctokitApp(
            Number(userData.currentWorkspace['installationId'])
        )

        const query: any = {
            owner: userData.currentWorkspace['name'],
            repo: getPRDto.repo,
            state: 'open',
            per_page: 100
        }

        const { data: pullRequests } = await octokit.rest.pulls.list(query)
        const prList: PullRequestResponse[] = []
        pullRequests.map((pr) => {
            prList.push({
                provider: 'github',
                prId: pr.id,
                prNumber: pr.number,
                prTitle: pr.title,
                prState: pr.state,
                prUser: pr.user?.login || 'Unknown',
                prUserAvatar: pr.user?.avatar_url || '',
                prCreatedAt: pr.created_at,
                prUpdatedAt: pr.updated_at,
                prClosedAt: pr.closed_at,
                prMergedAt: pr.merged_at,
                prUrl: pr.html_url
            } as PullRequestResponse)
        })
        return prList
    }

    async listOrgRepositories(user: any, filter?: string) {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (
            !userData ||
            !userData?.currentWorkspace ||
            !userData?.currentWorkspace['installationId']
        ) {
            throw new Error(
                'User or current workspace not found or installation ID missing'
            )
        }
        try {
            await this.validateAndGetInstalledOrg(
                +userData.currentWorkspace['installationId']
            )
        } catch (error) {
            return {
                invalidInstallationId: true,
                message: 'Organization installation not found or invalid'
            }
        }
        await this.validateAndGetInstalledOrg(
            +userData.currentWorkspace['installationId']
        )

        const octokit = await this.githubEventService.initOctokitApp(
            Number(userData.currentWorkspace['installationId'])
        )

        let allRepositories: Repository[] = []

        if (userData.currentWorkspace['type'] === 'User') {
            // For User workspaces, get all accessible repositories with pagination
            const repoData = await octokit.paginate(
                octokit.rest.apps.listReposAccessibleToInstallation,
                {
                    sort: 'created',
                    direction: 'desc',
                    per_page: 100
                }
            )
            allRepositories = repoData.map(
                (repo) =>
                    ({
                        id: repo.id,
                        name: repo.name,
                        fullName: repo.full_name,
                        slug: repo.name,
                        private: repo.private,
                        author: {
                            username: repo.owner.login,
                            avatarUrl: repo.owner.avatar_url
                        },
                        createdOn: repo.created_at,
                        updatedOn: repo.pushed_at,
                        openIssues: repo.open_issues_count
                    }) as Repository
            )
        } else {
            // For Organization workspaces, get all org repositories with pagination
            const orgRepos = await octokit.paginate(
                octokit.rest.repos.listForOrg,
                {
                    org: userData.currentWorkspace['name'],
                    type: 'all',
                    sort: 'created',
                    direction: 'desc',
                    per_page: 100
                }
            )
            allRepositories = orgRepos.map(
                (repo) =>
                    ({
                        id: repo.id,
                        name: repo.name,
                        fullName: repo.full_name,
                        slug: repo.name,
                        private: repo.private,
                        author: {
                            username: repo.owner.login,
                            avatarUrl: repo.owner.avatar_url
                        },
                        createdOn: repo.created_at,
                        updatedOn: repo.pushed_at,
                        openIssues: repo.open_issues_count
                    }) as Repository
            )
        }

        // Filter repositories based on the filter parameter
        if (filter === 'available') {
            // Get repositories that are already added to the current workspace
            const addedRepos = await this.dataService.repositories.find({
                workspace: userData.currentWorkspace['_id'],
                provider: 'github'
            })

            // Get the repository IDs that are already added
            const addedRepoIds = addedRepos.map((repo) => repo.id.toString())

            // Filter out repositories that are already added
            allRepositories = allRepositories.filter(
                (repo) => !addedRepoIds.includes(repo.id.toString())
            )
        }

        return allRepositories
    }

    async listUserRepositories(user: any, paginate: PaginateDto) {
        await this.initOctokit(user)
        const { page, limit } = paginate
        const perPage = limit || 10
        try {
            const response =
                await this.octokit.rest.repos.listForAuthenticatedUser({
                    visibility: 'all',
                    affiliation: 'owner,collaborator',
                    sort: 'updated',
                    direction: 'desc',
                    page,
                    per_page: paginate.limit
                })

            const repositories: Repository[] = response.data.map(
                (repo) =>
                    ({
                        id: repo.id,
                        name: repo.name,
                        fullName: repo.full_name,
                        slug: repo.name,
                        private: repo.private,
                        author: {
                            username: repo.owner.login,
                            avatarUrl: repo.owner.avatar_url
                        },
                        createdOn: repo.created_at,
                        updatedOn: repo.pushed_at,
                        openIssues: repo.open_issues_count
                    }) as Repository
            )

            return {
                repositories,
                pagination: {
                    page,
                    perPage,
                    totalCount: response.headers['x-total-count']
                        ? parseInt(String(response.headers['x-total-count']))
                        : null,
                    hasNext: response.data.length === perPage
                }
            }
        } catch (error) {
            throw new InternalServerErrorException(
                `Failed to fetch user repositories: ${error.message}`
            )
        }
    }

    async makePRReview(user: any, prReviewDto: PRReviewDto) {
        const existingAnalysis =
            await this.analysisService.getExistingPullRequestAndAnalysis(
                prReviewDto,
                'github'
            )
        if (existingAnalysis) {
            return existingAnalysis
        }
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (
            !userData ||
            !userData?.currentWorkspace ||
            !userData?.currentWorkspace['installationId']
        ) {
            throw new Error(
                'User or current workspace not found or installation ID missing'
            )
        }

        const octokit = await this.githubEventService.initOctokitApp(
            Number(userData.currentWorkspace['installationId'])
        )

        let pullRequestFormattedData: StructuredPRData =
            await this.githubEventService.createComprehensivePRAnalysis(
                userData.currentWorkspace['name'],
                prReviewDto.repo,
                +prReviewDto.prNumber,
                userData.currentWorkspace['installationId'],
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

        const workspace = userData.currentWorkspace as any
        const octokit = await this.githubEventService.initOctokitApp(
            Number(workspace.installationId)
        )
        let members
        if (workspace.type === 'User') {
            const { data: user } = await octokit.rest.users.getByUsername({
                username: workspace.slug
            })

            members = [
                {
                    provider: 'github',
                    providerId: user.id.toString(),
                    username: user.login,
                    avatarUrl: user.avatar_url,
                    displayName: user.name || user.login
                }
            ]
        } else {
            const org = workspace.slug
            const membersData = await octokit.paginate(
                octokit.orgs.listMembers,
                {
                    org: org,
                    per_page: 100
                }
            )
            members = membersData.map((member) => ({
                provider: 'github',
                providerId: member.id.toString(),
                username: member.login,
                avatarUrl: member.avatar_url,
                displayName: member.login
            }))
        }

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

    async processGithubEvent(event: any, payload: any) {
        let isApplicable
        let pullRequestFormattedData: StructuredPRData | boolean
        let prEvent
        switch (event) {
            case 'pull_request':
                if (
                    ['opened', 'synchronize', 'edited'].includes(payload.action)
                ) {
                    isApplicable =
                        await this.analysisService.checkApplicableForAnalysis(
                            payload.repository.name,
                            payload.repository.owner.login,
                            'github',
                            payload.sender.id.toString()
                        )
                    if (!isApplicable) {
                        return {}
                    }
                    prEvent =
                        payload.action == 'opened'
                            ? PREvent.CREATED
                            : PREvent.UPDATED
                    pullRequestFormattedData =
                        await this.githubEventService.handleGitHubPullRequest(
                            payload,
                            prEvent
                        )
                } else if ('closed' == payload.action) {
                    await this.analysisService.updatedPRState(
                        {
                            repo: payload.repository.name,
                            prNumber: payload.pull_request.number.toString(),
                            owner: payload.repository.owner.login,
                            provider: 'github'
                        },
                        {
                            prState:
                                payload.pull_request.merged == true
                                    ? PRState.MERGED
                                    : PRState.DECLINED
                        }
                    )
                    pullRequestFormattedData = false
                } else {
                    pullRequestFormattedData = false
                }
                break
            case 'installation':
                await this.githubEventService.handleGitHubInstallation(payload)
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
}
