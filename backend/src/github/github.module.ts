import { Module } from '@nestjs/common'
import { GithubEventService } from 'src/github/github-events.service'
import { BitbucketModule } from '../bitbucket/bitbucket.module'
import { GithubController } from './github.controller'
import { GithubService } from './github.service'

@Module({
    controllers: [GithubController],
    providers: [GithubService, GithubEventService],
    imports: [BitbucketModule],
    exports: [GithubEventService]
})
export class GithubModule {}
