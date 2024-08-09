import Button from "@mui/material/Button";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

interface DateRangePickerProps {
    minDate: number;
    maxDate: number;
    setMinDate: React.Dispatch<React.SetStateAction<number>>;
    setMaxDate: React.Dispatch<React.SetStateAction<number>>;
    minTimestamp: number;
    maxTimestamp: number;
}

export default function DateRangePicker({
    minDate,
    maxDate,
    setMinDate,
    setMaxDate,
    minTimestamp,
    maxTimestamp,
}: Readonly<DateRangePickerProps>) {
    return (
        <div className="flex items-center gap-4 p-2">
            <Button variant="outlined" onClick={() => setMinDate(minTimestamp)}>
                Set to earliest
            </Button>
            <DatePicker
                defaultValue={dayjs(minDate)}
                value={dayjs(minDate)}
                onChange={(e) => setMinDate(e?.valueOf() ?? 0)}
            />
            {"to"}
            <DatePicker
                defaultValue={dayjs(maxDate)}
                value={dayjs(maxDate)}
                onChange={(e) => setMaxDate(e?.valueOf() ?? 0)}
            />
            <Button variant="outlined" onClick={() => setMaxDate(maxTimestamp)}>
                Set to latest
            </Button>
        </div>
    );
}
