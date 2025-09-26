import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException
} from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): any {
        const ctx = host.switchToHttp()
        const request = ctx.getRequest()
        const response = ctx.getResponse()
        const status = exception.getStatus()

        response.status(status).json({
            success: false,
            statusCode: status,
            errors: exception.getResponse().message,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method
        })
    }
}
