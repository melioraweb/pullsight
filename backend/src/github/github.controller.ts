import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { PaginateDto } from 'src/common/dto/paginate.dto'
import {
    GetPRDto,
    InstallCallbackDto,
    PRReviewDto
} from 'src/github/dto/install-repo.dto'
import { GithubEventService } from 'src/github/github-events.service'
import { GithubService } from './github.service'

@Controller({
    path: 'github',
    version: '1'
})
export class GithubController {
    constructor(
        private readonly githubService: GithubService,
        private readonly githubEventService: GithubEventService,
        private readonly configService: ConfigService
    ) {}

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('organizations')
    async getOrgs(@Req() req) {
        return {
            message: 'Organizations fetched successfully',
            result: await this.githubService.getUserOrganizations(req.user)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('install')
    async redirectToGitHubApp(@Req() req) {
        const appSlug = this.configService.get<string>('GITHUB_APP_SLUG')
        const redirect = `https://github.com/apps/${appSlug}/installations/new?state=${req.user.sub}`
        return {
            redirect
        }
    }

    @Get('callback')
    async githubCallback(@Query() installCallbackDto: InstallCallbackDto) {
        const org = await this.githubService.addInstallOrg(installCallbackDto)
        const redirect = `${this.configService.get<string>('CLIENT_URL')}/onboarding/step-2`
        return { redirect }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('org-repos')
    async getOrgRepos(@Req() req: any, @Query('filter') filter?: string) {
        const repos = await this.githubService.listOrgRepositories(
            req.user,
            filter
        )
        return {
            message: 'Repositories fetched successfully',
            result: repos
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('user-repos')
    async getUserRepos(@Req() req: any, @Query() paginate: PaginateDto) {
        const repos = await this.githubService.listUserRepositories(
            req.user,
            paginate
        )
        return {
            message: 'User repositories fetched successfully',
            result: repos
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('repos-pr-list')
    async getRepoPRList(@Req() req: any, @Query() getPRDto: GetPRDto) {
        const repos = await this.githubService.listRepoPullRequests(
            req.user,
            getPRDto
        )
        return {
            message: 'Repositories fetched successfully',
            result: repos
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('review-pr')
    async reviewPR(@Req() req: any, @Query() prReviewDto: PRReviewDto) {
        const reviewData = await this.githubService.makePRReview(
            req.user,
            prReviewDto
        )
        return {
            message: 'Pull request reviewed successfully',
            result: reviewData
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('org-members')
    async getMembers(@Req() req: any, @Query() query: any) {
        return {
            message: 'Organization members fetched successfully',
            result: await this.githubService.getOrgMembers(req.user, query)
        }
    }

    @Post('events')
    async githubEvents(@Body() body: any, @Req() req) {
        const event = req.headers['x-github-event']
        this.githubService.processGithubEvent(event, body)
        return {
            message: 'GitHub events processed successfully',
            result: {}
        }
    }

    @Post('suggestions')
    async postSuggestions(@Body() name: string) {
        return {
            message: 'Suggestions posted successfully',
            result: {}
        }
    }

    @Post('post-pr')
    async postPr(@Body() body: string) {
        return {
            message: 'Post Pr successfully',
            result: {}
        }
    }
}
