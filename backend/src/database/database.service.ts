import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { PaginateModel } from 'mongoose'
import {
    EventLog,
    EventLogDocument
} from 'src/database/schemas/event-log.schema'
import {
    PullRequestAnalysisComment,
    PullRequestAnalysisCommentDocument
} from 'src/database/schemas/pull-request-analysis-comment.schema'
import {
    PullRequestAnalysis,
    PullRequestAnalysisDocument
} from 'src/database/schemas/pull-request-analysis.schema'
import {
    PullRequest,
    PullRequestDocument
} from 'src/database/schemas/pull-request.schema'
import {
    Repository,
    RepositoryDocument
} from 'src/database/schemas/repository.schema'
import {
    WorkspaceMember,
    WorkspaceMemberDocument
} from 'src/database/schemas/workspace-members.schema'
import {
    Workspace,
    WorkspaceDocument
} from 'src/database/schemas/workspace.schema'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class DatabaseService {
    users: PaginateModel<UserDocument>
    workspaces: PaginateModel<WorkspaceDocument>
    repositories: PaginateModel<RepositoryDocument>
    pullRequestAnalysisComments: PaginateModel<PullRequestAnalysisCommentDocument>
    pullRequestAnalysis: PaginateModel<PullRequestAnalysisDocument>
    eventLogs: PaginateModel<EventLogDocument>
    pullRequests: PaginateModel<PullRequestDocument>
    workspaceMembers: PaginateModel<WorkspaceMemberDocument>
    constructor(
        @InjectModel(User.name)
        private UserRepository: PaginateModel<UserDocument>,
        @InjectModel(Workspace.name)
        private WorkspaceRepository: PaginateModel<WorkspaceDocument>,
        @InjectModel(Repository.name)
        private RepositoryRepository: PaginateModel<RepositoryDocument>,
        @InjectModel(PullRequestAnalysisComment.name)
        private PullRequestAnalysisCommentsRepository: PaginateModel<PullRequestAnalysisCommentDocument>,
        @InjectModel(PullRequestAnalysis.name)
        private PullRequestAnalysisRepository: PaginateModel<PullRequestAnalysisDocument>,
        @InjectModel(EventLog.name)
        private EventLogRepository: PaginateModel<EventLogDocument>,
        @InjectModel(PullRequest.name)
        private PullRequestRepository: PaginateModel<PullRequestDocument>,
        @InjectModel(WorkspaceMember.name)
        private TeamMemberRepository: PaginateModel<WorkspaceMemberDocument>
    ) {}
    onApplicationBootstrap() {
        this.users = this.UserRepository
        this.workspaces = this.WorkspaceRepository
        this.repositories = this.RepositoryRepository
        this.pullRequestAnalysisComments =
            this.PullRequestAnalysisCommentsRepository
        this.pullRequestAnalysis = this.PullRequestAnalysisRepository
        this.eventLogs = this.EventLogRepository
        this.pullRequests = this.PullRequestRepository
        this.workspaceMembers = this.TeamMemberRepository
    }
}
