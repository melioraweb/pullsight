import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import axios from 'axios'
import { Profile, Strategy } from 'passport-bitbucket-oauth2'
import { AuthService } from '../auth.service'

@Injectable()
export class BitbucketStrategy extends PassportStrategy(Strategy, 'bitbucket') {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {
        super({
            clientID: configService.get('BITBUCKET_CLIENT_ID'),
            clientSecret: configService.get('BITBUCKET_CLIENT_SECRET'),
            callbackURL: `${configService.get('BASE_URL')}/v1/auth/bitbucket/callback`,
            scope: ['email', 'account']
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile
    ) {
        if (!profile.emails) {
            try {
                // Fetch user emails from Bitbucket API
                const emailResponse = await axios.get(
                    'https://api.bitbucket.org/2.0/user/emails',
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            Accept: 'application/json'
                        }
                    }
                )

                // Find primary email or first email
                const emails = emailResponse.data.values || []
                const primaryEmail =
                    emails.find((email) => email.is_primary) || emails[0]

                if (primaryEmail) {
                    // Add email to profile
                    profile.emails = [
                        {
                            value: primaryEmail.email,
                            verified: primaryEmail.is_confirmed
                        }
                    ]
                }
            } catch (error) {
                console.error(
                    'Error fetching Bitbucket user emails:',
                    error.response?.data || error.message
                )
            }
        }

        return this.authService.findOrCreateUser(
            profile,
            'bitbucket',
            accessToken,
            refreshToken
        )
    }
}
