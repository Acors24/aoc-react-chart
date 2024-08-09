import { LineChart } from "@mui/x-charts/LineChart";

interface ChartProps {
    minDate: number;
    maxDate: number;
    dataset: {
        [key: string]: number;
        timestamp: number;
    }[];
    displayNameToColor: {
        [key: string]: string;
    };
    visibleMembers: string[];
}

export default function Chart({
    minDate,
    maxDate,
    dataset,
    displayNameToColor,
    visibleMembers,
}: Readonly<ChartProps>) {
    return (
        <LineChart
            xAxis={[
                {
                    dataKey: "timestamp",
                    valueFormatter: (timestamp) =>
                        new Date(timestamp).toLocaleString(),
                    min: minDate,
                    max: maxDate,
                },
            ]}
            series={visibleMembers.map((memberName) => ({
                dataKey: memberName,
                label: memberName,
                color: displayNameToColor[memberName],
                type: "line",
                curve: "stepAfter",
                showMark: false,
            }))}
            dataset={dataset}
            skipAnimation
        />
    );
}
