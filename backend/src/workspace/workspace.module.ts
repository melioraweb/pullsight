import { Module } from '@nestjs/common'
import { BitbucketModule } from 'src/bitbucket/bitbucket.module'
import { GithubModule } from 'src/github/github.module'
import { WorkspaceController } from './workspace.controller'
import { WorkspaceService } from './workspace.service'

@Module({
    controllers: [WorkspaceController],
    providers: [WorkspaceService],
    imports: [BitbucketModule, GithubModule]
})
export class WorkspaceModule {}
