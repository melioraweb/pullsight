import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { DatabaseService } from 'src/database/database.service'
import { EventLogSchema } from 'src/database/schemas/event-log.schema'
import { PullRequestAnalysisCommentSchema } from 'src/database/schemas/pull-request-analysis-comment.schema'
import { PullRequestAnalysisSchema } from 'src/database/schemas/pull-request-analysis.schema'
import { PullRequestSchema } from 'src/database/schemas/pull-request.schema'
import { RepositorySchema } from 'src/database/schemas/repository.schema'
import { UserSchema } from 'src/database/schemas/user.schema'
import { WorkspaceMemberSchema } from 'src/database/schemas/workspace-members.schema'
import { WorkspaceSchema } from 'src/database/schemas/workspace.schema'

@Global()
@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get('MONGODB_URI')
            })
        }),
        MongooseModule.forFeature([
            { name: 'User', schema: UserSchema },
            { name: 'Workspace', schema: WorkspaceSchema },
            {
                name: 'PullRequestAnalysisComment',
                schema: PullRequestAnalysisCommentSchema
            },
            {
                name: 'PullRequestAnalysis',
                schema: PullRequestAnalysisSchema
            },
            { name: 'Repository', schema: RepositorySchema },
            { name: 'EventLog', schema: EventLogSchema },
            { name: 'PullRequest', schema: PullRequestSchema },
            { name: 'WorkspaceMember', schema: WorkspaceMemberSchema }
        ])
    ],
    controllers: [],
    providers: [DatabaseService],
    exports: [DatabaseService]
})
export class DatabaseModule {}
