// src/common/http/http.module.ts
import { HttpModule as NestHttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'
import { HttpService } from './http.service'

@Global()
@Module({
    imports: [NestHttpModule],
    providers: [HttpService],
    exports: [HttpService]
})
export class HttpModule {}
