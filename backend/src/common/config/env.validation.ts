import { plainToInstance } from 'class-transformer'
import {
    IsEnum,
    IsNumber,
    IsString,
    Max,
    Min,
    validateSync
} from 'class-validator'

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
    Provision = 'provision'
}

class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment

    @IsNumber()
    @Min(0)
    @Max(65535)
    PORT: number

    @IsString()
    MONGODB_URI: string

    @IsString()
    BASE_URL: string

    @IsString()
    BITBUCKET_CLIENT_ID: string

    @IsString()
    BITBUCKET_CLIENT_SECRET: string

    @IsString()
    GITHUB_CLIENT_ID: string

    @IsString()
    GITHUB_CLIENT_SECRET: string

    @IsString()
    GITHUB_APP_ID: string

    @IsString()
    GITHUB_PRIVATE_KEY_PATH: string

    @IsString()
    CLIENT_URL: string

    @IsString()
    JWT_SECRET: string

    @IsString()
    AI_AGENT_PR_POST_URL: string

    @IsString()
    DOMAIN: string
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true
    })
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false
    })

    if (errors.length > 0) {
        throw new Error(errors.toString())
    }
    return validatedConfig
}
