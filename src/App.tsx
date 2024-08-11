import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import Leaderboard from "./types/Leaderboard";
import { useCallback, useState } from "react";
import DayPart from "./types/DayPart";
import DayNumber from "./types/DayNumber";
import DateRangePicker from "./components/DateRangePicker";
import LeaderboardJsonInput from "./components/LeaderboardJsonInput";
import { findLast, insertSorted } from "./utilities";
import Chart from "./components/Chart";
import MemberList from "./components/MemberList";
import FileState from "./types/FileState";
import Alert from "@mui/material/Alert";    

function collectSortedTimestamps(leaderboard: Leaderboard) {
    let dayTimestamps: {
        [key in DayNumber]: {
            [key in DayPart]: { memberId: string; timestamp: number }[];
        };
    } = {
        1: { 1: [], 2: [] },
        2: { 1: [], 2: [] },
        3: { 1: [], 2: [] },
        4: { 1: [], 2: [] },
        5: { 1: [], 2: [] },
        6: { 1: [], 2: [] },
        7: { 1: [], 2: [] },
        8: { 1: [], 2: [] },
        9: { 1: [], 2: [] },
        10: { 1: [], 2: [] },
        11: { 1: [], 2: [] },
        12: { 1: [], 2: [] },
        13: { 1: [], 2: [] },
        14: { 1: [], 2: [] },
        15: { 1: [], 2: [] },
        16: { 1: [], 2: [] },
        17: { 1: [], 2: [] },
        18: { 1: [], 2: [] },
        19: { 1: [], 2: [] },
        20: { 1: [], 2: [] },
        21: { 1: [], 2: [] },
        22: { 1: [], 2: [] },
        23: { 1: [], 2: [] },
        24: { 1: [], 2: [] },
        25: { 1: [], 2: [] },
    };

    for (const member of Object.values(leaderboard.members)) {
        const displayName = getDisplayName(member.id, leaderboard);
        for (const [day, dayData] of Object.entries(
            member.completion_day_level
        )) {
            for (const [part, partData] of Object.entries(dayData)) {
                insertSorted(
                    dayTimestamps[day as DayNumber][part as DayPart],
                    {
                        memberId: displayName,
                        timestamp: partData.get_star_ts * 1000,
                    },
                    (a, b) => a.timestamp - b.timestamp
                );
            }
        }
    }

    return dayTimestamps;
}

function gatherChanges(leaderboard: Leaderboard) {
    const dayTimestamps = collectSortedTimestamps(leaderboard);
    const amountOfMembers = Object.values(leaderboard.members).length;

    const changes: {
        [key: string]: { timestamp: number; scoreDelta: number }[];
    } = {};
    for (const dayData of Object.values(dayTimestamps)) {
        for (const partData of Object.values(dayData)) {
            for (let i = 0; i < partData.length; i++) {
                const member_id = partData[i].memberId;
                if (!(member_id in changes)) {
                    changes[member_id] = [];
                }

                insertSorted(
                    changes[member_id],
                    {
                        timestamp: partData[i].timestamp,
                        scoreDelta: amountOfMembers - i,
                    },
                    (a, b) => a.timestamp - b.timestamp
                );
            }
        }
    }

    return changes;
}

function accumulateChanges(changes: {
    [key: string]: { timestamp: number; scoreDelta: number }[];
}): {
    [key: string]: { timestamp: number; score: number }[];
} {
    const scores: {
        [key: string]: { timestamp: number; score: number }[];
    } = {};

    for (const [member_id, memberChanges] of Object.entries(changes)) {
        let score = 0;
        scores[member_id] = [];
        for (const change of memberChanges) {
            score += change.scoreDelta;
            scores[member_id].push({ timestamp: change.timestamp, score });
        }
    }

    return scores;
}

function getDisplayName(memberId: number, leaderboard: Leaderboard): string {
    const member = Object.values(leaderboard.members).find(
        (member) => member.id === memberId
    );
    return member?.name ?? memberId.toString();
}

function getMemberScoreAtTimestamp(
    memberName: string,
    timestamp: number,
    scores: { [key: string]: { timestamp: number; score: number }[] }
) {
    const memberScores = scores[memberName];
    const score = findLast(
        memberScores,
        (score) => timestamp >= score.timestamp
    );
    return score?.score ?? 0;
}

function scoresToDataPoints(scores: {
    [key: string]: { timestamp: number; score: number }[];
}) {
    const memberNames = Object.keys(scores);

    const timestampSet = new Set<number>();
    for (const memberScores of Object.values(scores)) {
        for (const score of memberScores) {
            timestampSet.add(score.timestamp);
        }
    }
    const timestamps = Array.from(timestampSet).sort((a, b) => a - b);

    const dataPoints: { timestamp: number; [key: string]: number }[] = [];
    for (const timestamp of timestamps) {
        const dataPoint = { timestamp };
        for (const memberName of memberNames) {
            const memberScore = getMemberScoreAtTimestamp(
                memberName,
                timestamp,
                scores
            );
            Object.assign(dataPoint, { [memberName]: memberScore });
        }
        dataPoints.push(dataPoint);
    }

    return dataPoints;
}

function getColors(scores: {
    [key: string]: {
        timestamp: number;
        score: number;
    }[];
}) {
    const memberNames = Object.keys(scores);
    const colors = memberNames.reduce((acc, memberName, index) => {
        const hue = (index * 360) / memberNames.length;
        acc[memberName] = `hsl(${hue}, 50%, 50%)`;
        return acc;
    }, {} as { [key: string]: string });
    return colors;
}

function App() {
    const [fileState, setFileState] = useState<FileState>({
        type: "none",
    });

    const [scores, setScores] = useState<{
        [key: string]: { timestamp: number; score: number }[];
    } | null>(null);

    const [minDate, setMinDate] = useState<number>(
        new Date(2023, 11, 1).getTime()
    );
    const [maxDate, setMaxDate] = useState<number>(
        new Date(2023, 11, 26).getTime()
    );

    const [minTimestamp, setMinTimestamp] = useState<number>(0);
    const [maxTimestamp, setMaxTimestamp] = useState<number>(0);

    const [displayNameToColor, setDisplayNameToColor] = useState<{
        [key: string]: string;
    }>({});

    const [memberVisibility, setMemberVisibility] = useState<{
        [key: string]: boolean;
    }>({});

    const updateLeaderboard = useCallback(async function (
        leaderboard: Leaderboard
    ) {
        const changes = gatherChanges(leaderboard);
        const scores = accumulateChanges(changes);
        setScores(scores);
        setDisplayNameToColor(getColors(scores));
        setMemberVisibility(
            Object.fromEntries(
                Object.keys(scores).map((memberName) => [memberName, true])
            )
        );

        const allTimestamps = Object.values(scores).flatMap((memberScores) =>
            memberScores.map((score) => score.timestamp)
        );

        setMinTimestamp(Math.min(...allTimestamps));
        setMaxTimestamp(Math.max(...allTimestamps));
    },
    []);

    function setSingleMemberVisibility(memberName: string, visible: boolean) {
        setMemberVisibility((prev) => {
            return { ...prev, [memberName]: visible };
        });
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="h-screen">
                <div className="flex justify-between p-2 h-[4em]">
                    <LeaderboardJsonInput
                        updateLeaderboard={updateLeaderboard}
                        setFileState={setFileState}
                    />

                    {scores && (
                        <DateRangePicker
                            minDate={minDate}
                            maxDate={maxDate}
                            setMinDate={setMinDate}
                            setMaxDate={setMaxDate}
                            minTimestamp={minTimestamp}
                            maxTimestamp={maxTimestamp}
                        />
                    )}
                </div>

                {fileState.type === "none" && (
                    <Alert severity="info">
                        Select a JSON leaderboard file to get started.
                    </Alert>
                )}

                {fileState.type === "error" && (
                    <Alert severity="error">{fileState.message}</Alert>
                )}

                {scores && (
                    <div className="flex h-[calc(100vh-4em)]">
                        <Chart
                            {...{
                                minDate,
                                maxDate,
                                dataset: scoresToDataPoints(scores),
                                displayNameToColor,
                                visibleMembers: Object.keys(scores).filter(
                                    (memberName) => memberVisibility[memberName]
                                ),
                            }}
                        />

                        <MemberList
                            {...{
                                scores,
                                setSingleMemberVisibility,
                                displayNameToColor,
                            }}
                        />
                    </div>
                )}
            </div>
        </LocalizationProvider>
    );
}

export default App;
