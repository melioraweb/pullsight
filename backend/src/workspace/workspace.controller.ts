import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { WorkspaceOwnerGuard } from 'src/auth/guards/workspace-owner.guard'
import { PaginateDto } from 'src/common/dto/paginate.dto'
import { DATA_RETRIEVED, UPDATED } from 'src/common/utils/response-message.util'
import { CreateAndUpdateWorkspaceSettingsDto } from 'src/workspace/dto/create-update-workspace-settings.dto'
import { MakeSubscriptionDto } from 'src/workspace/dto/make-subscription.dto'
import { UpdateMemberDto } from 'src/workspace/dto/update-member.dto'
import { UpdateRepositoryDto } from 'src/workspace/dto/update-repository.dto'
import {
    CreateMembersDto,
    CreateRepositoryDto
} from './dto/create-repository.dto'
import { WorkspaceService } from './workspace.service'

@Controller({
    path: 'workspace',
    version: '1'
})
export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) {}

    @UseGuards(AuthGuard('jwt-cookie'))
    @Post('subscription')
    async makeSubscription(
        @Body() makeSubscriptionDto: MakeSubscriptionDto,
        @Req() req: any
    ) {
        return {
            message: 'Subscription created successfully',
            result: await this.workspaceService.makeSubscription(
                makeSubscriptionDto,
                req.user
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'), WorkspaceOwnerGuard)
    @Post('repositories')
    async createRepository(
        @Body() createRepositoryDto: CreateRepositoryDto,
        @Req() req: any
    ) {
        return {
            message: 'Repositories added successfully',
            result: await this.workspaceService.createRepository(
                createRepositoryDto,
                req.user
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'), WorkspaceOwnerGuard)
    @Post('members')
    async createMembers(
        @Body() createMembersDto: CreateMembersDto,
        @Req() req: any
    ) {
        return {
            message: 'Members added successfully',
            result: await this.workspaceService.addMembers(
                createMembersDto,
                req.user
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'), WorkspaceOwnerGuard)
    @Patch('update-settings')
    async updateWorkspace(
        @Req() req,
        @Body()
        createAndUpdateWorkspaceSettingsDto: CreateAndUpdateWorkspaceSettingsDto
    ) {
        return {
            message: UPDATED,
            result: await this.workspaceService.createAndUpdateWorkspaceSettings(
                req.user,
                createAndUpdateWorkspaceSettingsDto
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('team-members')
    async findAll(
        @Req() req: any,
        @Query() paginate: PaginateDto,
        @Query() filter: any
    ) {
        const result = await this.workspaceService.findAllWorkspaceTeamMember(
            req.user,
            paginate,
            filter
        )
        return {
            message: DATA_RETRIEVED,
            result: result
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('repositories')
    async findAllRepositories(@Req() req: any, @Query() query: any) {
        return {
            message: 'Repositories fetched successfully',
            result: await this.workspaceService.findAllRepositories(
                req.user,
                query
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'), WorkspaceOwnerGuard)
    @Patch('repositories/:id')
    async updateRepository(
        @Param('id') id: string,
        @Body() body: UpdateRepositoryDto,
        @Req() req: any
    ) {
        return {
            message: 'Repository updated successfully',
            result: await this.workspaceService.updateRepository(
                id,
                body,
                req.user
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Patch('members/:id')
    async updateMembers(
        @Param('id') id: string,
        @Body() body: UpdateMemberDto,
        @Req() req: any
    ) {
        return {
            message: 'Repository updated successfully',
            result: await this.workspaceService.updateMember(id, body, req.user)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('pr-list')
    async findPRs(@Req() req: any, @Query() query: any) {
        return {
            message: 'Pull requests fetched successfully',
            result: await this.workspaceService.findPRs(req.user, query)
        }
    }
}
