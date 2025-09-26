import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { PullRequestAnalysisCommentsDto } from 'src/analysis/dto/post-analysis-comments.dto'
import { PullRequestAnalysisDto } from 'src/analysis/dto/post-analysis.dto'
import { AnalysisService } from './analysis.service'

@Controller({
    path: 'analysis',
    version: '1'
})
export class AnalysisController {
    constructor(private readonly analysisService: AnalysisService) {}

    @Post('reviews')
    async postReview(@Body() postReviewDto: PullRequestAnalysisCommentsDto) {
        return {
            message: 'Review posted successfully',
            result: await this.analysisService.addPRReviewComments(
                postReviewDto
            )
        }
    }

    @Post('summary')
    async postSummary(@Body() postSummery: PullRequestAnalysisDto) {
        return {
            message: 'Summary posted successfully',
            result: await this.analysisService.addPRSummery(postSummery)
        }
    }

    @Get(':pullRequestAnalysisId')
    async getPRAnalysisData(
        @Param('pullRequestAnalysisId') pullRequestAnalysisId: string
    ) {
        return {
            message: 'Pull request analysis data fetched successfully',
            result: await this.analysisService.getPRAnalysisData(
                pullRequestAnalysisId
            )
        }
    }
}
