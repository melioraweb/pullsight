import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AddWorkspaceDto } from 'src/common/dto/add-workspace.dto'
import { PaginateDto } from 'src/common/dto/paginate.dto'
import { GetPRDto, PRReviewDto } from 'src/github/dto/install-repo.dto'
import { BitbucketEventsService } from './bitbucket-events.service'
import { BitbucketService } from './bitbucket.service'

@Controller({
    path: 'bitbucket',
    version: '1'
})
export class BitbucketController {
    constructor(
        private readonly bitbucketService: BitbucketService,
        private readonly bitbucketEventsService: BitbucketEventsService
    ) {}

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('organizations')
    async getAllWorkspaces(@Req() req) {
        return {
            message: 'Organizations fetched successfully',
            result: await this.bitbucketService.getAllWorkspaces(req.user)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('org-repos')
    async getWorkspaceRepositories(
        @Req() req: any,
        @Query('filter') filter?: string
    ) {
        return {
            message: 'Workspace repositories fetched successfully',
            result: await this.bitbucketService.getWorkspaceRepositories(
                req.user,
                filter
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('user-repos')
    async getOrganizationSpeficiRepositories(
        @Req() req: any,
        @Query() paginate: PaginateDto
    ) {
        return {
            message: 'User repositories fetched successfully',
            result: await this.bitbucketService.listOrganizationSpecificRepositories(
                req.user,
                paginate
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Post('add-workspace')
    async addWorkspace(
        @Req() req: any,
        @Body() addWorkspaceDto: AddWorkspaceDto
    ) {
        return {
            message: 'Workspace added successfully',
            result: await this.bitbucketService.addWorkspace(
                req.user,
                addWorkspaceDto
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('repos-pr-list')
    async getPullRequests(@Req() req: any, @Query() getPRDto: GetPRDto) {
        return {
            message: 'Pull requests fetched successfully',
            result: await this.bitbucketService.getPullRequests(
                req.user,
                getPRDto
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('review-pr')
    async reviewPR(@Req() req: any, @Query() prReviewDto: PRReviewDto) {
        const reviewData = await this.bitbucketService.makePRReview(
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
            result: await this.bitbucketService.getOrgMembers(req.user, query)
        }
    }

    @Post('events')
    async bitbucketEvents(@Body() body: any, @Req() req) {
        const event = req.headers['x-event-key']
        this.bitbucketService.processBitbucketEvent(event, body)
        return {
            message: 'Bitbucket events processed successfully',
            result: {}
        }
    }
}
