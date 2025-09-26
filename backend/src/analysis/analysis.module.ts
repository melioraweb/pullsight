import { Global, Module } from '@nestjs/common'
import { BitbucketModule } from 'src/bitbucket/bitbucket.module'
import { GithubModule } from 'src/github/github.module'
import { AnalysisController } from './analysis.controller'
import { AnalysisService } from './analysis.service'

@Global()
@Module({
    controllers: [AnalysisController],
    providers: [AnalysisService],
    imports: [GithubModule, BitbucketModule],
    exports: [AnalysisService]
})
export class AnalysisModule {}
