import { Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { DatabaseService } from 'src/database/database.service'
import {
    IssueAnalysisCardFilterDto,
    IssueCardFilterDto,
    PrAnalysisCardFilterDto,
    TimeAndMoneySaveCardFilterDto
} from './dto/dashboardFilter.dto'

@Injectable()
export class DashboardService {
    constructor(private readonly dataService: DatabaseService) {}

    async getPrAnalysisCard(
        user: any,
        prAnalysisCardFilterDto: PrAnalysisCardFilterDto
    ) {
        const findUser = await this.dataService.users.findOne(
            { _id: user.sub, provider: user.provider },
            'currentWorkspace'
        )

        if (!findUser || !findUser.currentWorkspace) {
            return {
                graphChart: [],
                opened: 0,
                merged: 0,
                declined: 0,
                total: 0
            }
        }

        const findWorkspace = await this.dataService.workspaces.findOne(
            { _id: findUser.currentWorkspace },
            'slug'
        )

        if (!findWorkspace) {
            return {
                graphChart: [],
                opened: 0,
                merged: 0,
                declined: 0,
                total: 0
            }
        }

        // Set default date range if not provided (last 30 days)
        const toDate = prAnalysisCardFilterDto.to
            ? new Date(prAnalysisCardFilterDto.to)
            : new Date()

        // Adjust toDate to include the entire day
        toDate.setUTCHours(23, 59, 59, 999)
        const fromDate = prAnalysisCardFilterDto.from
            ? new Date(prAnalysisCardFilterDto.from)
            : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        // Adjust toDate to include the entire day
        fromDate.setUTCHours(23, 59, 59, 999)

        const match: any = {
            owner: findWorkspace.slug,
            createdAt: {
                $gte: fromDate,
                $lte: toDate
            }
        }

        if (prAnalysisCardFilterDto.repo) {
            match.repo = prAnalysisCardFilterDto.repo
        }

        // Get overall totals
        const prAnalysis = await this.dataService.pullRequests.aggregate([
            { $match: match },
            { $group: { _id: '$prState', count: { $sum: 1 } } }
        ])

        // Transform aggregation result to required format
        const totals = {
            opened: 0,
            merged: 0,
            declined: 0,
            total: 0
        }

        prAnalysis.forEach((item) => {
            const state = item._id?.toLowerCase()
            if (state === 'open' || state === 'opened') {
                totals.opened = item.count
            } else if (
                state === 'merged' ||
                state === 'merge' ||
                state === 'closed'
            ) {
                totals.merged = item.count
            } else if (state === 'declined' || state === 'decline') {
                totals.declined = item.count
            }
            totals.total += item.count
        })

        // Get time series data based on breakdown
        const breakdown = prAnalysisCardFilterDto.breakdown || 'day'
        const graphChart = await this.getTimeSeriesData(
            match,
            fromDate,
            toDate,
            breakdown
        )

        return {
            graphChart,
            ...totals
        }
    }

    async getIssueAnalysisCard(
        user: any,
        issueAnalysisCardFilterDto: IssueAnalysisCardFilterDto
    ) {
        const findUser = await this.dataService.users.findOne(
            { _id: user.sub, provider: user.provider },
            'currentWorkspace'
        )
        if (!findUser || !findUser.currentWorkspace) {
            return {
                major: 0,
                minor: 0,
                info: 0,
                critical: 0,
                blocker: 0,
                total: 0
            }
        }

        // Set default date range if not provided (last 30 days)
        const toDate = issueAnalysisCardFilterDto.to
            ? new Date(issueAnalysisCardFilterDto.to)
            : new Date()

        // Adjust toDate to include the entire day
        toDate.setUTCHours(23, 59, 59, 999)
        const fromDate = issueAnalysisCardFilterDto.from
            ? new Date(issueAnalysisCardFilterDto.from)
            : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        // Adjust toDate to include the entire day
        fromDate.setUTCHours(23, 59, 59, 999)

        // Build the simplified match query using direct workspace reference
        const match: any = {
            workspace: findUser.currentWorkspace,
            createdAt: {
                $gte: fromDate,
                $lte: toDate
            }
        }

        // Add repository filter if provided
        if (issueAnalysisCardFilterDto.repo) {
            match.repositorySlug = issueAnalysisCardFilterDto.repo
        }

        // Simplified aggregation - no need for complex lookups
        const prAnalysisReviewSeveritys =
            await this.dataService.pullRequestAnalysisComments.aggregate([
                { $match: match },
                { $group: { _id: '$severity', count: { $sum: 1 } } }
            ])

        // Transform aggregation result to required format
        const totals = {
            major: 0,
            minor: 0,
            info: 0,
            critical: 0,
            blocker: 0,
            total: 0
        }

        prAnalysisReviewSeveritys.forEach((item) => {
            const state = item._id?.toLowerCase()
            if (state === 'Major' || state === 'major') {
                totals.major = item.count
            } else if (state === 'Minor' || state === 'minor') {
                totals.minor = item.count
            } else if (state === 'Info' || state === 'info') {
                totals.info = item.count
            } else if (state === 'Critical' || state === 'critical') {
                totals.critical = item.count
            } else if (state === 'Blocker' || state === 'blocker') {
                totals.blocker = item.count
            }
            totals.total += item.count
        })

        return {
            ...totals
        }
    }

    async getTimeAndMoneySaveCard(
        user: any,
        timeAndMoneySaveCardFilterDto: TimeAndMoneySaveCardFilterDto
    ) {
        const findUser = await this.dataService.users.findOne(
            { _id: user.sub, provider: user.provider },
            'currentWorkspace'
        )

        if (!findUser || !findUser.currentWorkspace) {
            return {
                graphChart: [],
                totalTimeSaved: 0,
                totalMoneySaved: 0,
                hourlyRate: 50,
                averageTimePerPR: 0,
                ROI: 0
            }
        }

        const findWorkspace = await this.dataService.workspaces.findOne(
            { _id: findUser.currentWorkspace },
            'slug workspaceSetting prFiles'
        )
        if (!findWorkspace) {
            return {
                graphChart: [],
                totalTimeSaved: 0,
                totalMoneySaved: 0,
                hourlyRate: 50,
                averageTimePerPR: 0,
                ROI: 0
            }
        }

        // Get hourly rate from workspace prFiles (default to 50 if not set)
        const hourlyRate = findWorkspace.workspaceSetting?.hourlyRate || 50
        // Set default date range if not provided (last 30 days)
        const toDate = timeAndMoneySaveCardFilterDto.to
            ? new Date(timeAndMoneySaveCardFilterDto.to)
            : new Date()

        // Adjust toDate to include the entire day
        toDate.setUTCHours(23, 59, 59, 999)
        const fromDate = timeAndMoneySaveCardFilterDto.from
            ? new Date(timeAndMoneySaveCardFilterDto.from)
            : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        // Adjust toDate to include the entire day
        fromDate.setUTCHours(23, 59, 59, 999)

        // Build match criteria for pull request analysis
        const analysisMatch: any = {
            workspaceSlug: findWorkspace.slug,
            createdAt: {
                $gte: fromDate,
                $lte: toDate
            }
        }

        if (timeAndMoneySaveCardFilterDto.repo) {
            analysisMatch.repositorySlug = timeAndMoneySaveCardFilterDto.repo
        }

        // Get all PR analyses with populated pull request data
        const prAnalyses = await this.dataService.pullRequestAnalysis
            .find(analysisMatch)
            .populate({
                path: 'pullRequest',
                populate: {
                    path: 'prFiles'
                }
            })
            .exec()
        // const prAnalyses = await this.dataService.pullRequestAnalysis.findOne({
        //     workspaceSlug: findWorkspace.slug
        // })

        let totalTimeSaved = 0
        let totalLinesReviewed = 0
        const timeSeriesData: Map<string, number> = new Map()

        for (const analysis of prAnalyses) {
            if (analysis.pullRequest) {
                const pullRequest = analysis.pullRequest as any

                // Use total line counts from PR schema
                const prTotalLineAddition = pullRequest.prTotalLineAddition || 0
                const prTotalLineDeletion = pullRequest.prTotalLineDeletion || 0

                const timeInSecondToReviewPrLine = 30
                const totalPrReviewTimeInSeconds =
                    (prTotalLineAddition + prTotalLineDeletion) *
                    timeInSecondToReviewPrLine
                const totalPrReviewTimeInHour =
                    totalPrReviewTimeInSeconds / 3600

                totalTimeSaved += analysis.estimatedCodeReviewEffort
                totalLinesReviewed += prTotalLineAddition + prTotalLineDeletion

                // Group by time period for chart data
                const breakdown =
                    timeAndMoneySaveCardFilterDto.breakdown || 'day'
                const dateKey = this.formatDateByBreakdown(
                    (analysis as any).createdAt,
                    breakdown
                )

                timeSeriesData.set(
                    dateKey,
                    (timeSeriesData.get(dateKey) || 0) + totalPrReviewTimeInHour
                )
            }
        }

        // Calculate money saved
        // totalTimeSaved = prAnalyses ? prAnalyses.estimatedCodeReviewEffort : 0
        // totalLinesReviewed = prAnalyses ? prAnalyses.totalLinesChanged : 0
        totalTimeSaved = parseFloat((totalTimeSaved / 60).toFixed(2)) // Convert minutes to hours
        const totalMoneySaved = totalTimeSaved * hourlyRate
        const averageTimePerPR = 0

        // Generate time series chart data
        const breakdown = timeAndMoneySaveCardFilterDto.breakdown || 'day'
        const graphChart = this.generateTimeSeriesChart(
            timeSeriesData,
            fromDate,
            toDate,
            breakdown
        )

        return {
            graphChart,
            totalTimeSaved: totalTimeSaved.toFixed(2), // Hours, rounded to 2 decimal places
            totalMoneySaved: totalMoneySaved.toFixed(2), // Currency, rounded to 2 decimal places
            averageTimePerPR: 0, // Hours, rounded to 2 decimal places
            totalLinesReviewed,
            totalPRsAnalyzed: 0
        }
    }

    async issueCard(user: any, issueCardFilterDto: IssueCardFilterDto) {
        const findUser = await this.dataService.users.findOne(
            { _id: user.sub, provider: user.provider },
            'currentWorkspace'
        )

        if (!findUser || !findUser.currentWorkspace) {
            return {
                issueCardData: [],
                totalCount: {
                    Critical: 0,
                    Major: 0,
                    Minor: 0,
                    Info: 0,
                    Blocker: 0,
                    total: 0
                }
            }
        }

        // Set default date range if not provided (last 30 days)
        const toDate = issueCardFilterDto.to
            ? new Date(issueCardFilterDto.to)
            : new Date()

        // Adjust toDate to include the entire day
        toDate.setUTCHours(23, 59, 59, 999)
        const fromDate = issueCardFilterDto.from
            ? new Date(issueCardFilterDto.from)
            : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        // Adjust toDate to include the entire day
        fromDate.setUTCHours(23, 59, 59, 999)

        // Build the base match query
        const baseMatch: any = {
            workspace: findUser.currentWorkspace,
            createdAt: {
                $gte: fromDate,
                $lte: toDate
            }
        }

        let pullRequest
        if (issueCardFilterDto.pullRequest) {
            baseMatch['pullRequest'] = Types.ObjectId.createFromHexString(
                issueCardFilterDto.pullRequest
            )
            pullRequest = await this.dataService.pullRequests
                .findOne({
                    _id: issueCardFilterDto.pullRequest
                })
                .select(
                    'provider prTitle prUrl prNumber prUser prUserAvatar repo owner prState prCreatedAt'
                )
        }

        // Add repository filter if provided
        if (issueCardFilterDto.repo) {
            baseMatch.repositorySlug = issueCardFilterDto.repo
        }

        // Match for total docs
        const baseMatchForTotalCount = { ...baseMatch }

        // Add severity filter if provided
        if (issueCardFilterDto.severity) {
            baseMatch.severity = issueCardFilterDto.severity
        }

        // Build pullRequest match conditions for prUser and prState filtering
        const pullRequestMatch: any = {}
        if (issueCardFilterDto.prUser) {
            pullRequestMatch['pullRequest.prUser'] = issueCardFilterDto.prUser
        }
        if (issueCardFilterDto.prState) {
            pullRequestMatch['pullRequest.prState'] = issueCardFilterDto.prState
        }

        // Get pagination parameters
        const page = issueCardFilterDto.page || 1
        const limit = issueCardFilterDto.limit || 10
        const skip = (page - 1) * limit

        // Use aggregation starting from pullRequestAnalysisComments table
        const aggregationPipeline: any[] = [
            { $match: baseMatch },
            {
                $lookup: {
                    from: 'pullrequests',
                    localField: 'pullRequest',
                    foreignField: '_id',
                    as: 'pullRequest'
                }
            },
            { $unwind: '$pullRequest' },
            {
                $lookup: {
                    from: 'workspaces',
                    localField: 'workspace',
                    foreignField: '_id',
                    as: 'workspace'
                }
            },
            { $unwind: '$workspace' },
            // Apply pullRequest filters BEFORE pagination
            ...(Object.keys(pullRequestMatch).length > 0
                ? [{ $match: pullRequestMatch }]
                : []),
            {
                $addFields: {
                    daysOpen: {
                        $floor: {
                            $divide: [
                                {
                                    $subtract: [
                                        new Date(),
                                        {
                                            $dateFromString: {
                                                dateString:
                                                    '$pullRequest.prCreatedAt'
                                            }
                                        }
                                    ]
                                },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    },
                    status: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: ['$pullRequest.prState', 'merged']
                                    },
                                    then: 'Merged'
                                },
                                {
                                    case: {
                                        $eq: [
                                            '$pullRequest.prState',
                                            'declined'
                                        ]
                                    },
                                    then: 'Rejected'
                                },
                                {
                                    case: {
                                        $eq: ['$pullRequest.prState', 'closed']
                                    },
                                    then: 'Approved'
                                }
                            ],
                            default: 'Opened'
                        }
                    }
                }
            },
            // Sort BEFORE pagination
            { $sort: { updatedAt: -1, createdAt: -1 } },
            {
                $project: {
                    id: '$_id',
                    pr: {
                        $concat: [
                            'PR #',
                            {
                                $toString: '$pullRequest.prNumber'
                            }
                        ]
                    },
                    prTitle: '$pullRequest.prTitle',
                    prUrl: '$pullRequest.prUrl',
                    avatarUrl: '$workspace.avatarUrl',
                    owner: {
                        $ifNull: ['$pullRequest.prUser', 'Unknown']
                    },
                    prUser: '$pullRequest.prUser',
                    severity: 1,
                    status: 1,
                    daysOpen: 1,
                    updated: {
                        $ifNull: ['$updatedAt', '$createdAt']
                    },
                    repositorySlug: 1,
                    prNumber: '$pullRequest.prNumber',
                    prState: '$pullRequest.prState',
                    category: 1,
                    content: 1,
                    filePath: 1,
                    lineStart: 1,
                    lineEnd: 1,
                    codeSnippet: 1,
                    codeSnippetLineStart: 1
                }
            },
            // Apply pagination AFTER all filtering and sorting
            { $skip: skip },
            { $limit: limit }
        ]

        // Create count aggregation pipeline to get total documents
        const countPipeline: any[] = [
            { $match: baseMatch },
            {
                $lookup: {
                    from: 'pullrequests',
                    localField: 'pullRequest',
                    foreignField: '_id',
                    as: 'pullRequest'
                }
            },
            { $unwind: '$pullRequest' },
            ...(Object.keys(pullRequestMatch).length > 0
                ? [{ $match: pullRequestMatch }]
                : []),
            { $count: 'total' }
        ]

        // Create severity counts aggregation pipeline
        const severityCountsPipeline: any[] = [
            { $match: baseMatchForTotalCount },
            {
                $lookup: {
                    from: 'pullrequests',
                    localField: 'pullRequest',
                    foreignField: '_id',
                    as: 'pullRequest'
                }
            },
            { $unwind: '$pullRequest' },
            // ...(Object.keys(pullRequestMatch).length > 0
            //     ? [{ $match: pullRequestMatch }]
            //     : []),
            {
                $group: {
                    _id: '$severity',
                    count: { $sum: 1 }
                }
            }
        ]

        // Execute all aggregation queries in parallel
        const [issueCardData, severityCounts, totalCountResult] =
            await Promise.all([
                this.dataService.pullRequestAnalysisComments.aggregate(
                    aggregationPipeline
                ),
                this.dataService.pullRequestAnalysisComments.aggregate(
                    severityCountsPipeline
                ),
                this.dataService.pullRequestAnalysisComments.aggregate(
                    countPipeline
                )
            ])

        // Get total documents count
        const totalDocs =
            totalCountResult.length > 0 ? totalCountResult[0].total : 0
        const totalPages = Math.ceil(totalDocs / limit)

        // Calculate pagination metadata
        const hasPrevPage = page > 1
        const hasNextPage = page < totalPages
        const prevPage = hasPrevPage ? page - 1 : null
        const nextPage = hasNextPage ? page + 1 : null
        const pagingCounter = totalDocs > 0 ? (page - 1) * limit + 1 : 0

        // Process severity counts
        const totalCount = {
            Critical: 0,
            Major: 0,
            Minor: 0,
            Info: 0,
            Blocker: 0,
            total: 0
        }

        severityCounts.forEach((item: any) => {
            const severity = item._id
            if (severity && totalCount.hasOwnProperty(severity)) {
                totalCount[severity] = item.count
            }
            totalCount.total += item.count
        })

        return {
            pullRequest: pullRequest || null,
            issueCardData: issueCardData,
            totalCount: totalCount,
            totalDocs: totalDocs,
            limit: limit,
            totalPages: totalPages,
            page: page,
            pagingCounter: pagingCounter,
            hasPrevPage: hasPrevPage,
            hasNextPage: hasNextPage,
            prevPage: prevPage,
            nextPage: nextPage
        }
    }

    private async getTimeSeriesData(
        match: any,
        fromDate: Date,
        toDate: Date,
        breakdown: 'day' | 'month' | 'year'
    ) {
        let groupBy: any
        let dateFormat: string
        let incrementUnit: 'day' | 'month' | 'year'

        switch (breakdown) {
            case 'year':
                groupBy = {
                    year: { $year: '$createdAt' }
                }
                dateFormat = 'YYYY'
                incrementUnit = 'year'
                break
            case 'month':
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                }
                dateFormat = 'YYYY-MM'
                incrementUnit = 'month'
                break
            case 'day':
            default:
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                }
                dateFormat = 'YYYY-MM-DD'
                incrementUnit = 'day'
                break
        }

        // Aggregate PRs by time period
        const prTimeSeriesData = await this.dataService.pullRequests.aggregate([
            { $match: match },
            {
                $group: {
                    _id: groupBy,
                    total: { $sum: 1 },
                    opened: {
                        $sum: {
                            $cond: [
                                {
                                    $in: [
                                        '$prState',
                                        ['open', 'opened', 'OPEN']
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    merged: {
                        $sum: {
                            $cond: [
                                {
                                    $in: [
                                        '$prState',
                                        ['merged', 'merge', 'closed', 'MERGED']
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    declined: {
                        $sum: {
                            $cond: [
                                {
                                    $in: [
                                        '$prState',
                                        ['declined', 'decline', 'DECLINED']
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date:
                        breakdown === 'year'
                            ? {
                                  $dateFromParts: {
                                      year: '$_id.year',
                                      month: 1,
                                      day: 1
                                  }
                              }
                            : breakdown === 'month'
                              ? {
                                    $dateFromParts: {
                                        year: '$_id.year',
                                        month: '$_id.month',
                                        day: 1
                                    }
                                }
                              : {
                                    $dateFromParts: {
                                        year: '$_id.year',
                                        month: '$_id.month',
                                        day: '$_id.day'
                                    }
                                },
                    total: 1,
                    opened: 1,
                    merged: 1,
                    declined: 1
                }
            },
            { $sort: { date: 1 } }
        ])

        // Fill missing time periods with zero values
        const result: Array<{
            date: string
            total: number
            opened: number
            merged: number
            declined: number
        }> = []

        const current = new Date(fromDate)
        const end = new Date(toDate)

        while (current <= end) {
            const dateStr = this.formatDateByBreakdown(current, breakdown)
            const existingData = prTimeSeriesData.find(
                (item) =>
                    this.formatDateByBreakdown(item.date, breakdown) === dateStr
            )

            result.push({
                date: dateStr,
                total: existingData?.total || 0,
                opened: existingData?.opened || 0,
                merged: existingData?.merged || 0,
                declined: existingData?.declined || 0
            })

            this.incrementDate(current, incrementUnit)
        }

        return result
    }

    private formatDateByBreakdown(date: Date, breakdown: string): string {
        switch (breakdown) {
            case 'year':
                return date.getFullYear().toString()
            case 'month':
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            case 'day':
            default:
                return date.toISOString().split('T')[0]
        }
    }

    private incrementDate(date: Date, unit: 'day' | 'month' | 'year'): void {
        switch (unit) {
            case 'year':
                date.setFullYear(date.getFullYear() + 1)
                break
            case 'month':
                date.setMonth(date.getMonth() + 1)
                break
            case 'day':
            default:
                date.setDate(date.getDate() + 1)
                break
        }
    }

    private generateTimeSeriesChart(
        timeSeriesData: Map<string, number>,
        fromDate: Date,
        toDate: Date,
        breakdown: 'day' | 'month' | 'year'
    ): Array<{ date: string; timeSaved: number }> {
        const result: Array<{ date: string; timeSaved: number }> = []
        const current = new Date(fromDate)
        const end = new Date(toDate)

        while (current <= end) {
            const dateStr = this.formatDateByBreakdown(current, breakdown)
            const timeSaved = timeSeriesData.get(dateStr) || 0

            result.push({
                date: dateStr,
                timeSaved: Math.round((timeSaved / 60) * 100) / 100 // Convert to hours and round
            })

            this.incrementDate(current, breakdown)
        }

        return result
    }

    private countChangedLines(diff: string): number {
        return (
            diff
                .split('\n')
                .filter((line) => line.startsWith('+') || line.startsWith('-'))
                // ignore diff headers like '--- a/...' or '+++ b/...'
                .filter(
                    (line) => !line.startsWith('+++') && !line.startsWith('---')
                ).length
        )
    }
}
