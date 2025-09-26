import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { BitbucketModule } from '../bitbucket/bitbucket.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { BitbucketStrategy } from './strategies/bitbucket.strategy'
import { GithubStrategy } from './strategies/github.strategy'
import { JwtCookieStrategy } from './strategies/jwt-cookie.strategy'

@Module({
    imports: [
        ConfigModule,
        PassportModule,
        BitbucketModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1d' }
            }),
            inject: [ConfigService]
        })
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        GithubStrategy,
        BitbucketStrategy,
        JwtCookieStrategy
    ]
})
export class AuthModule {}
