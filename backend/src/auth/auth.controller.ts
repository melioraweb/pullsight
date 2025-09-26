import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Req,
    Res,
    UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { UpdateOnboardingStepDto } from 'src/auth/dto/update-onboarding-step.dto'
import {
    LOGOUT,
    SUCCESS,
    UPDATED
} from 'src/common/utils/response-message.util'
import { BitbucketService } from '../bitbucket/bitbucket.service'
import { AuthService } from './auth.service'

@Controller({
    path: 'auth',
    version: '1'
})
export class AuthController {
    clientUrl: string
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly bitbucketService: BitbucketService
    ) {
        this.clientUrl = this.configService.get('CLIENT_URL') || ''
    }

    @Get('github')
    @UseGuards(AuthGuard('github'))
    githubLogin() {}

    @UseGuards(AuthGuard('jwt-cookie'))
    @Post('logout')
    async logout() {
        return {
            message: LOGOUT,
            logout: true
        }
    }

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    githubCallback(@Req() req, @Res() res: Response) {
        return {
            redirect: this.clientUrl,
            token: this.authService.generateJwt(req.user)
        }
    }

    @Get('bitbucket')
    @UseGuards(AuthGuard('bitbucket'))
    bitbucketLogin() {}

    @Get('bitbucket/callback')
    @UseGuards(AuthGuard('bitbucket'))
    bitbucketCallback(@Req() req, @Res() res: Response) {
        return {
            redirect: this.clientUrl,
            token: this.authService.generateJwt(req.user)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('profile')
    async getProfile(@Req() req) {
        return {
            message: SUCCESS,
            result: await this.authService.getProfile(req.user.sub)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Patch('update-profile')
    async updateProfile(
        @Req() req,
        @Body() updateProfileDto: UpdateOnboardingStepDto
    ) {
        return {
            message: UPDATED,
            result: await this.authService.updateProfile(
                req.user,
                updateProfileDto
            )
        }
    }
}
