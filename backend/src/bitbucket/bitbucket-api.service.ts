import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaginateDto } from 'src/common/dto/paginate.dto'
import { OrgType } from 'src/common/enums/org.enum'
import { HttpService } from 'src/common/http/http.service'
import {
    PullRequestResponse,
    Repository
} from 'src/common/interfaces/repository.interface'
import { Workspace } from 'src/database/schemas/workspace.schema'

@Injectable()
export class BitbucketApiService {
    private readonly baseUrl = 'https://api.bitbucket.org/2.0'
    private readonly oauthBaseUrl = 'https://bitbucket.org/site/oauth2'

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {}

    /**
     * Get authorization headers for Bitbucket API
     */
    private getAuthHeaders(accessToken: string) {
        return {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    }

    /**
     * Get all workspaces for the authenticated user
     */
    async getAllWorkspaces(accessToken: string): Promise<Workspace[]> {
        let allWorkspaces: Workspace[] = []
        let url = `${this.baseUrl}/user/permissions/workspaces?pagelen=100`
        const response = await this.httpService.get(url, {
            headers: this.getAuthHeaders(accessToken)
        })

        await Promise.all(
            response.values.map(async (data) => {
                const { user } = data
                let url = `${this.baseUrl}/workspaces/${data.workspace.slug}`
                const workspace = await this.httpService.get(url, {
                    headers: this.getAuthHeaders(accessToken)
                })
                if (data.permission == 'owner')
                    allWorkspaces.push({
                        id: workspace.uuid,
                        name: workspace.name,
                        slug: workspace.slug,
                        provider: 'bitbucket',
                        url: workspace.links.html.href,
                        reposUrl: `${this.baseUrl}/repositories/${workspace.slug}`,
                        avatarUrl: workspace.links.avatar?.href,
                        type: OrgType.ORGANIZATION,
                        nodeId: `BB_${workspace.uuid}`,
                        description: workspace.description,
                        isPrivate: workspace.is_private,
                        createdOn: workspace.created_on
                    })
            })
        )
        return allWorkspaces
    }

    /**
     * Get single workspace by slug
     * @param slug - The slug of the workspace to fetch
     * @returns Workspace object or null if not found
     */
    async getSingleWorkspace(
        accessToken: string,
        slug: string
    ): Promise<Workspace> {
        let url = `${this.baseUrl}/workspaces/${slug}`
        const workspace = await this.httpService.get(url, {
            headers: this.getAuthHeaders(accessToken)
        })
        return {
            id: workspace.uuid,
            name: workspace.name,
            slug: workspace.slug,
            provider: 'bitbucket',
            url: workspace.links.html.href,
            reposUrl: `${this.baseUrl}/repositories/${workspace.slug}`,
            avatarUrl: workspace.links.avatar?.href,
            type:
                workspace.type == 'user' ? OrgType.USER : OrgType.ORGANIZATION,
            nodeId: `BB_${workspace.uuid}`,
            description: workspace.description,
            isPrivate: workspace.is_private,
            createdOn: workspace.created_on
        }
    }

    /**
     * Get repositories for a specific workspace
     */
    async getWorkspaceRepositories(
        accessToken: string,
        workspace: string
    ): Promise<Repository[]> {
        let allRepositories: Repository[] = []
        let url = `${this.baseUrl}/repositories/${workspace}?pagelen=100`

        // Paginate through all repositories
        while (url) {
            const response = await this.httpService.get(url, {
                headers: this.getAuthHeaders(accessToken)
            })

            // Add repositories from current page
            if (response.values && Array.isArray(response.values)) {
                const repositories = response.values.map((repo) =>
                    this.mapRepositoryResponse(repo)
                )
                allRepositories.push(...repositories)
            }

            // Check if there's a next page
            url = response.next || null
        }

        return allRepositories
    }

    /**
     * Get repositories for a specific workspace with pagination
     */
    async getWorkspaceRepositoriesPaginated(
        accessToken: string,
        workspace: string,
        paginate: PaginateDto
    ): Promise<any> {
        const url = `${this.baseUrl}/repositories/${workspace}?pagelen=${paginate.limit}&page=${paginate.page}`

        const response = await this.httpService.get(url, {
            headers: this.getAuthHeaders(accessToken)
        })

        // Transform repositories to match the expected format
        const repositories =
            response.values?.map((repo) => this.mapRepositoryResponse(repo)) ||
            []

        return {
            values: repositories,
            size: response.size || repositories.length,
            page: response.page || paginate.page,
            pagelen: response.pagelen || paginate.limit,
            next: response.next || null,
            previous: response.previous || null
        }
    }

    /**
     * Add webhook to a specific repository
     */
    async addWebhook(
        accessToken: string,
        workspace: string,
        repository: string,
        webhookUrl: string,
        events: string[]
    ): Promise<any> {
        const webhookPayload = {
            description:
                'PullSight AI Webhook - Automated webhook for pull request and issue analysis',
            url: webhookUrl,
            active: true,
            events: events
        }

        const response = await this.httpService.post(
            `${this.baseUrl}/repositories/${workspace}/${repository}/hooks`,
            webhookPayload,
            {
                headers: this.getAuthHeaders(accessToken)
            }
        )

        return {
            message: 'Webhook successfully added!',
            repository: {
                workspace: workspace,
                name: repository,
                fullName: `${workspace}/${repository}`
            },
            webhook: {
                id: response.uuid,
                url: response.url,
                description: response.description,
                active: response.active,
                events: response.events,
                createdAt: response.created_at,
                links: response.links
            }
        }
    }

    /**
     * Map Bitbucket API repository response to our interface
     */
    private mapRepositoryResponse(repo: any): Repository {
        return {
            id: repo.uuid,
            name: repo.name,
            fullName: repo.full_name,
            slug: repo.slug,
            createdOn: repo.created_on,
            updatedOn: repo.updated_on,
            author: {
                username: repo?.owner?.username || repo?.owner?.nickname,
                avatarUrl: repo.owner?.links?.avatar?.href
            },
            private: repo.is_private,
            openIssues: repo.open_issues_count || 0
        } as Repository
    }

    /**
     * Get pull requests for a specific repository
     */
    async getPullRequests(
        accessToken: string,
        workspace: string,
        repository: string,
        state?: string,
        limit?: number
    ): Promise<PullRequestResponse[]> {
        let allPullRequests: PullRequestResponse[] = []
        const pageLimit = 50
        let nextUrl = `${this.baseUrl}/repositories/${workspace}/${repository}/pullrequests?pagelen=${pageLimit}`

        // Add state filter if provided
        if (state) {
            nextUrl += `&state=${state.toUpperCase()}`
        }

        // Paginate through all results
        while (nextUrl) {
            const response = await this.httpService.get(nextUrl, {
                headers: this.getAuthHeaders(accessToken)
            })

            // Process current page
            if (response.values && Array.isArray(response.values)) {
                response.values.forEach((pr) => {
                    allPullRequests.push({
                        provider: 'bitbucket',
                        prId: pr.id,
                        prNumber: pr.id,
                        prTitle: pr.title,
                        prState: pr.state.toLowerCase(),
                        prUser: pr.author?.nickname || 'unknown',
                        prUserAvatar: pr.author?.links?.avatar?.href || '',
                        prCreatedAt: pr.created_on,
                        prUpdatedAt: pr.updated_on,
                        prClosedAt:
                            pr.state === 'DECLINED' || pr.state === 'SUPERSEDED'
                                ? pr.updated_on
                                : null,
                        prMergedAt:
                            pr.state === 'MERGED' ? pr.updated_on : null,
                        prUrl: pr.links?.html?.href || ''
                    })
                })
            }

            // Check if there's a next page
            nextUrl = response.next || null
        }
        return allPullRequests
    }

    /**
     * Get workspace members for Bitbucket
     */
    async getOrgMembers(accessToken: string, workspace: string) {
        let allMembers: any[] = []
        let url = `${this.baseUrl}/workspaces/${workspace}/members?pagelen=100`

        const response = await this.httpService.get(url, {
            headers: this.getAuthHeaders(accessToken)
        })

        if (response.values && Array.isArray(response.values)) {
            response.values.forEach((member) => {
                allMembers.push({
                    provider: 'bitbucket',
                    providerId: member.user?.uuid.toString(),
                    username: member.user?.nickname,
                    displayName:
                        member.user?.display_name || member.display_name,
                    avatarUrl:
                        member.user?.links?.avatar?.href ||
                        member.links?.avatar?.href
                })
            })
        }
        return allMembers
    }

    async refreshAccessToken(refreshToken: string): Promise<{
        access_token: string
        refresh_token?: string
        expires_in: number
    } | null> {
        const bitbucketTokenUrl =
            this.configService.get('BITBUCKET_TOKEN_URL') ||
            'https://bitbucket.org/site/oauth2/access_token'
        const clientId = this.configService.get('BITBUCKET_CLIENT_ID')
        const clientSecret = this.configService.get('BITBUCKET_CLIENT_SECRET')
        const response = await this.httpService.post(
            bitbucketTokenUrl,
            {
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            },
            {
                auth: {
                    username: clientId,
                    password: clientSecret
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )
        return response
    }

    async getBitbucketPRAndRepo(
        accessToken: string,
        workspace: string,
        repo: string,
        prId: number
    ) {
        const pullrequest = await this.httpService.get(
            `${this.baseUrl}/repositories/${workspace}/${repo}/pullrequests/${prId}`,
            {
                headers: this.getAuthHeaders(accessToken)
            }
        )
        const repository = await this.httpService.get(
            `${this.baseUrl}/repositories/${workspace}/${repo}`,
            {
                headers: this.getAuthHeaders(accessToken)
            }
        )
        return {
            pullrequest,
            repository
        }
    }

    async fetchPRDiff(
        workspace: string,
        repository: string,
        pullRequestId: number,
        accessToken: string
    ): Promise<string | null> {
        const apiUrl = `${this.baseUrl}/repositories/${workspace}/${repository}/pullrequests/${pullRequestId}/diff`
        return await this.httpService.get(apiUrl, {
            headers: this.getAuthHeaders(accessToken)
        })
    }

    extractFileDiff(fullDiff: string | null, filePath: string): string {
        if (!fullDiff || !filePath) {
            return 'No diff available'
        }

        const escapedFileName = filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const filePattern = new RegExp(
            `diff --git a/${escapedFileName} b/${escapedFileName}[\\s\\S]*?(?=diff --git|$)`,
            'g'
        )
        const fileDiffMatch = fullDiff.match(filePattern)
        return fileDiffMatch
            ? fileDiffMatch[0].trim()
            : 'No diff available for this file'
    }

    /**
     * Remove webhook from a specific repository
     */
    async removeWebhook(
        accessToken: string,
        workspace: string,
        repository: string,
        webhookId: string
    ): Promise<any> {
        const apiEndpoint = `${this.baseUrl}/repositories/${workspace}/${repository}/hooks/${webhookId}`

        await this.httpService.delete(apiEndpoint, {
            headers: this.getAuthHeaders(accessToken)
        })

        return {
            message: 'Webhook successfully removed!',
            repository: {
                workspace,
                name: repository,
                fullName: `${workspace}/${repository}`
            },
            webhookId
        }
    }
}
