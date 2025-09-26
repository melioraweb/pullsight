import { HttpService as NestHttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { AxiosError, AxiosRequestConfig } from 'axios'
import { catchError, lastValueFrom, throwError } from 'rxjs'

@Injectable()
export class HttpService {
    constructor(private readonly http: NestHttpService) {}

    private convertAxiosError(error: AxiosError): never {
        console.error(
            'Third party api error:==========',
            error?.response?.data,
            error
        )
        const status =
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
        const responseData = error.response?.data as any
        const message =
            responseData?.message ||
            responseData?.error ||
            error.message ||
            'External API error'

        throw new HttpException(
            {
                message: `External API Error: ${message}`,
                statusCode: status,
                error: error.response?.statusText || 'External API Error'
            },
            status >= 400 && status < 500 ? status : HttpStatus.BAD_GATEWAY
        )
    }

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const res$ = this.http.get<T>(url, config).pipe(
            catchError((error: AxiosError) => {
                this.convertAxiosError(error)
                return throwError(() => error)
            })
        )
        const res = await lastValueFrom(res$)
        return res.data
    }

    async getWithHandleCatch<T = any>(
        url: string,
        config?: AxiosRequestConfig
    ) {
        try {
            const res$ = this.http.get<T>(url, config)
            const res = await lastValueFrom(res$)
            return res.data
        } catch (error) {
            return null
        }
    }

    async post<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const res$ = this.http.post<T>(url, data, config).pipe(
            catchError((error: AxiosError) => {
                this.convertAxiosError(error)
                return throwError(() => error)
            })
        )
        const res = await lastValueFrom(res$)
        return res.data
    }

    async put<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const res$ = this.http.put<T>(url, data, config).pipe(
            catchError((error: AxiosError) => {
                this.convertAxiosError(error)
                return throwError(() => error)
            })
        )
        const res = await lastValueFrom(res$)
        return res.data
    }

    async delete<T = any>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const res$ = this.http.delete<T>(url, config).pipe(
            catchError((error: AxiosError) => {
                this.convertAxiosError(error)
                return throwError(() => error)
            })
        )
        const res = await lastValueFrom(res$)
        return res.data
    }
}
