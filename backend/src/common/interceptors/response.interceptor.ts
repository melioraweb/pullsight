import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Injectable,
    NestInterceptor
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
    statusCode: number
    message: string
    data: T
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    constructor(private readonly configService: ConfigService) {}
    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<Response<T>> {
        const ctx = context.switchToHttp()
        const response = ctx.getResponse()

        response.status(HttpStatus.OK)
        return next.handle().pipe(
            map((data) => {
                if (data?.redirect) {
                    response.status(HttpStatus.FOUND)
                    if (data?.token) {
                        response.cookie('accessToken', data.token, {
                            httpOnly: true,
                            sameSite: 'lax',
                            domain: `.${this.configService.get<string>('DOMAIN')}`,
                            maxAge: 7 * 24 * 60 * 60 * 1000 // 7days
                        })
                    }
                    return response.redirect(data.redirect)
                }

                if (data?.logout) {
                    response.clearCookie('accessToken', {
                        httpOnly: true,
                        sameSite: 'lax',
                        domain: `.${this.configService.get<string>('DOMAIN')}`
                    })
                }
                return {
                    success: true,
                    statusCode: HttpStatus.OK,
                    message: data.message || 'Request successful',
                    data: data.result
                }
            })
        )
    }
}
