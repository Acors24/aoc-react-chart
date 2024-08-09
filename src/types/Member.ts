import DayNumber from "./DayNumber";
import DayPart from "./DayPart";

type Member = {
    id: number;
    global_score: number;
    last_star_ts: number;
    name: string | null;
    completion_day_level: {
        [key in DayNumber]?: {
            [key in DayPart]?: {
                star_index: number;
                get_star_ts: number;
            };
        };
    };
    local_score: number;
    stars: number;
}

export default Member;