import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UpdateOnboardingStepDto } from 'src/auth/dto/update-onboarding-step.dto'
import { DatabaseService } from 'src/database/database.service'

@Injectable()
export class AuthService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly jwtService: JwtService
    ) {}

    async findOrCreateUser(
        profile: any,
        provider: string,
        accessToken: string,
        refreshToken: string
    ) {
        let profileUrl
        let user = await this.dataService.users.findOne({
            provider,
            providerId: profile.id
        })

        // Use provider-specific default expiry times since tokens are not JWTs
        const defaultExpiry = {
            bitbucket: 3600, // 1 hour
            github: 28800 // 8 hours (GitHub App tokens)
        }
        const expiry = defaultExpiry[provider] || 7200 // Default to 2 hours
        const tokenExpiresAt = new Date(Date.now() + expiry * 1000)
        const invitation = await this.dataService.workspaceMembers.findOne({
            provider: provider,
            providerId: profile.id,
            joinedAt: null
        })
        if (profile.provider == 'bitbucket') {
            profileUrl =
                profile._json['links'].avatar.href || profile.photos?.[0]?.value
        } else if (profile.provider == 'github') {
            profileUrl = profile.photos?.[0]?.value || profile.avatarUrl
        }
        if (!user) {
            user = await this.dataService.users.create({
                provider,
                providerId: profile.id,
                username: profile.username,
                displayName: profile.displayName,
                email: profile.emails?.[0]?.value,
                avatarUrl: profileUrl,
                accessToken,
                refreshToken,
                tokenExpiresAt,
                raw: profile._raw,
                workspaces: []
            })
            if (invitation) {
                user.currentWorkspace = invitation.workspace
            }
        } else {
            user.displayName = profile.displayName
            user.email = profile.emails?.[0]?.value
            user.avatarUrl = profileUrl
            user.accessToken = accessToken
            user.refreshToken = refreshToken
            user.tokenExpiresAt = tokenExpiresAt
        }
        if (invitation && !invitation.joinedAt) {
            if (!user.currentWorkspace) {
                user.currentWorkspace = invitation.workspace
            }
            invitation.joinedAt = new Date()
            invitation.user = user._id as any
            invitation.save()
            user.workspaces?.push(invitation.workspace)
        }
        await user.save()
        return await this.getProfile(user._id)
    }

    generateJwt(user: any) {
        const payload = {
            sub: user._id,
            email: user.email,
            provider: user.provider
        }
        return this.jwtService.sign(payload, { expiresIn: '7d' })
    }

    async getProfile(userId: any) {
        return await this.dataService.users
            .findOne({
                _id: userId
            })
            .populate([
                {
                    path: 'currentWorkspace'
                },
                {
                    path: 'workspaces'
                }
            ])
    }

    async updateProfile(user: any, updateProfileDto: UpdateOnboardingStepDto) {
        let updateOperation: any = {}

        if (updateProfileDto.currentWorkspace === null) {
            // Use $unset to remove the field from MongoDB document
            updateOperation = {
                $unset: { currentWorkspace: '' },
                $set: { ...updateProfileDto }
            }
            delete updateOperation.$set.currentWorkspace
        } else if (updateProfileDto.currentWorkspace === undefined) {
            delete updateProfileDto.currentWorkspace
            updateOperation = { $set: { ...updateProfileDto } }
        } else {
            updateOperation = { $set: { ...updateProfileDto } }
        }

        await this.dataService.users.updateOne(
            {
                _id: user.sub
            },
            updateOperation,
            { new: true }
        )
        return await this.getProfile(user.sub)
    }
}
