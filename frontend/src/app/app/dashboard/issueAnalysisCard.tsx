import { useDashboardIssueAnalysisQuery } from "@/api/queries/dashboard";
import ContentCard from "@/components/reusable/ContentCard";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dayjs";
import {
    CartesianGrid,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts";

interface Props {
    className?: string;
    fromDate?: string;
    toDate?: string;
    repo?: string | null;
    breakdown?: string | null;
}

const IssueAnalysisCard = ({
    className,
    fromDate,
    toDate,
    repo,
    breakdown,
}: Props) => {
    const { data, isFetching } = useDashboardIssueAnalysisQuery({
        from: fromDate,
        to: toDate,
        breakdown,
        repo,
    });
    return (
        <ContentCard className={cn(``, className)}>
            <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4 min-h-[61px]">
                <h3 className="text-muted font-semibold">Issues</h3>
            </ContentCard.Header>
            <ContentCard.Body
                isLoading={isFetching}
                className="flex-1 flex flex-col"
            >
                <div className="flex divide-x lg:gap-9 pb-5 lg:py-5">
                    <div className="pr-5 lg:pr-9">
                        <div className="opacity-50 text-xs mb-1">Total</div>
                        <div className="text-3xl">{data?.data?.total || 0}</div>
                    </div>
                    {/* <div className="pr-5 lg:pr-9">
                        <div className="opacity-50 text-xs mb-1">
                            Completion Rate
                        </div>
                        <div className="text-3xl">0%</div>
                    </div> */}
                </div>
                <div className="border rounded-xl flex-1 overflow-hidden">
                    {data?.data?.total < 1 ? (
                        <div className="text-center text-muted p-6 h-full flex items-center justify-center">
                            No issues data found for the selected period.
                        </div>
                    ) : (
                        <ChartContainer
                            className="w-full h-64 sm:h-72 md:h-80 max-h-[400px]"
                            config={{
                                warning: {
                                    label: "Warning",
                                    color: "warning",
                                },
                                critical: {
                                    label: "Critical",
                                    color: "critical",
                                },
                                info: {
                                    label: "Info",
                                    color: "info",
                                },
                            }}
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={[
                                        {
                                            name: "info",
                                            value: data?.data?.info || 0,
                                            fill: "#39D5F7",
                                        },
                                        {
                                            name: "minor",
                                            value: data?.data?.minor || 0,
                                            fill: "#fdc800",
                                        },
                                        {
                                            name: "major",
                                            value: data?.data?.major || 0,
                                            fill: "#ff8905",
                                        },
                                        {
                                            name: "critical",
                                            value: data?.data?.critical || 0,
                                            fill: "#F85661",
                                        },
                                        {
                                            name: "blocker",
                                            value: data?.data?.blocker || 0,
                                            fill: "#960002",
                                        },
                                    ]}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius="50%"
                                    paddingAngle={2}
                                    outerRadius="70%"
                                    cx="50%"
                                    cy="45%"
                                />
                                <ChartLegend
                                    content={({ payload }) => (
                                        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-1 mb-5 px-4">
                                            {payload?.map((entry, index) => {
                                                const count =
                                                    entry.payload?.value || 0;
                                                const percentage = data?.data
                                                    ?.total
                                                    ? Math.round(
                                                          (count /
                                                              data.data.total) *
                                                              100
                                                      )
                                                    : 0;
                                                return (
                                                    <div
                                                        key={`legend-${index}`}
                                                        className="flex items-center gap-1.5 text-xs"
                                                    >
                                                        <div
                                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                                            style={{
                                                                backgroundColor:
                                                                    entry.color,
                                                            }}
                                                        />
                                                        <span className="capitalize whitespace-nowrap">
                                                            {entry.value} (
                                                            {percentage}%)
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    className=""
                                />
                            </PieChart>
                        </ChartContainer>
                    )}
                </div>
            </ContentCard.Body>
        </ContentCard>
    );
};

export default IssueAnalysisCard;
