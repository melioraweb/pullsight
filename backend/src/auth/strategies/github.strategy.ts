import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-github2'
import { AuthService } from '../auth.service'

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {
        super({
            clientID: configService.get('GITHUB_CLIENT_ID'),
            clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
            callbackURL: `${configService.get('BASE_URL')}/v1/auth/github/callback`,
            scope: ['user:email', 'read:user']
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile
    ) {
        return this.authService.findOrCreateUser(
            profile,
            'github',
            accessToken,
            refreshToken
        )
    }
}
