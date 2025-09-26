import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/database/database.module'
import { BitbucketApiService } from './bitbucket-api.service'
import { BitbucketEventsService } from './bitbucket-events.service'
import { BitbucketController } from './bitbucket.controller'
import { BitbucketService } from './bitbucket.service'

@Module({
    imports: [HttpModule, DatabaseModule],
    controllers: [BitbucketController],
    providers: [BitbucketService, BitbucketApiService, BitbucketEventsService],
    exports: [BitbucketService, BitbucketApiService, BitbucketEventsService]
})
export class BitbucketModule {}
