import { useDashboardPrAnalysisQuery } from "@/api/queries/dashboard";
import ContentCard from "@/components/reusable/ContentCard";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dayjs";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

interface Props {
    className?: string;
    fromDate?: string;
    toDate?: string;
    repo?: string | null;
    breakdown?: string | null;
}

const PrAnalysisCard = ({
    className,
    fromDate,
    toDate,
    repo,
    breakdown,
}: Props) => {
    const { data, isFetching } = useDashboardPrAnalysisQuery({
        from: fromDate,
        to: toDate,
        repo,
        breakdown,
    });
    return (
        <ContentCard className={cn(``, className)}>
            <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4 min-h-[61px]">
                <h3 className="text-muted font-semibold">PRs</h3>
            </ContentCard.Header>
            <ContentCard.Body
                isLoading={isFetching}
                className="flex-1 flex flex-col"
            >
                <div className="flex divide-x gap-5 lg:gap-9 pb-5 lg:py-5">
                    <div className="pr-5 lg:pr-9">
                        <div className="opacity-50 text-xs mb-1">Open</div>
                        <div className="text-3xl">
                            {data?.data?.opened || 0}
                        </div>
                    </div>
                    <div className="pr-5 lg:pr-9">
                        <div className="opacity-50 text-xs mb-1">Merged</div>
                        <div className="text-3xl">
                            {data?.data?.merged || 0}
                        </div>
                    </div>
                    <div className="pr-5 lg:pr-9">
                        <div className="opacity-50 text-xs mb-1">Declined</div>
                        <div className="text-3xl">
                            {data?.data?.declined || 0}
                        </div>
                    </div>
                </div>
                <ChartContainer
                    className="border py-3 pr-3 rounded-xl flex-1 max-h-[400px]"
                    config={{
                        total: {
                            label: "Total",
                            color: "primary",
                        },
                    }}
                >
                    <LineChart
                        data={data?.data?.graphChart || []}
                        margin={{
                            left: 0,
                            right: 0,
                        }}
                        key={`chart-${data?.data?.graphChart?.length || 0}`}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={15}
                            height={40}
                            tickFormatter={(value) =>
                                formatDate(
                                    value,
                                    breakdown == "year"
                                        ? "YYYY"
                                        : breakdown == "month"
                                        ? "MMM YY"
                                        : "DD MMM"
                                )
                            }
                            angle={-45}
                            padding={{ right: 20 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={0}
                            width={35}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <Line
                            dataKey="total"
                            type="monotone"
                            stroke="#39d5f7"
                            strokeWidth={2}
                            animationDuration={1000}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </ContentCard.Body>
        </ContentCard>
    );
};

export default PrAnalysisCard;
