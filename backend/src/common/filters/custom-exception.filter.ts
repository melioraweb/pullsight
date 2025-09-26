import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpAdapterHost } from '@nestjs/core'
import { AxiosError } from 'axios'
import { isArray } from 'class-validator'
import { MongoServerError } from 'mongodb'
import mongoose from 'mongoose'
import { ERROR } from 'src/common/utils/response-message.util'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly configService: ConfigService
    ) {}

    catch(exception: any, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost
        const ctx = host.switchToHttp()
        let responseBody: { [key: string]: any } = {}
        const path = httpAdapter.getRequestUrl(ctx.getRequest())
        const response = ctx.getResponse()

        if (exception instanceof mongoose.Error.ValidationError) {
            responseBody = {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Validation error',
                error: Object.values(exception.errors)[0].message
            }
        } else if (
            exception instanceof MongoServerError &&
            exception.code === 11000
        ) {
            responseBody = {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Duplicate field value error',
                error: `${Object.keys(exception.keyValue).join(', ')} already exists!`
            }
        } else if (exception instanceof AxiosError) {
            const status = exception.response?.status || HttpStatus.BAD_GATEWAY
            const errorData = exception.response?.data
            responseBody = {
                statusCode: status,
                message:
                    errorData?.error_description ||
                    errorData?.message ||
                    exception.message,
                error: errorData?.error || 'External API Error'
            }
        } else if (exception instanceof HttpException) {
            const exceptionData = Object.assign({}, exception.getResponse())
            responseBody = {
                statusCode: exception.getStatus(),
                message: exceptionData['error'] || exceptionData['message'],
                error: isArray(exceptionData['message'])
                    ? exceptionData['message'][0]
                    : exceptionData['message']
            }
        } else {
            responseBody = {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: exception.toString(),
                message: ERROR
            }
        }

        // Redirect to client URL for auth callback
        const pattern = /^\/v1\/auth\/[^\/]+\/callback/
        if (pattern.test(path)) {
            return response.redirect(
                this.configService.get('CLIENT_URL') as string
            )
        }

        if (responseBody.statusCode == 401) {
            response.clearCookie('accessToken', {
                httpOnly: true,
                sameSite: 'lax',
                domain: `.${this.configService.get<string>('DOMAIN')}`
            })
        }

        responseBody = {
            success: false,
            ...responseBody,
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            method: httpAdapter.getRequestMethod(ctx.getRequest()),
            timestamp: new Date().toISOString()
        }

        httpAdapter.reply(
            ctx.getResponse(),
            responseBody,
            responseBody.statusCode
        )
    }
}
