import { UploadFile } from "@mui/icons-material";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Leaderboard from "../types/Leaderboard";
import React from "react";
import Member from "../types/Member";
import HelpButton from "./HelpButton";

interface LeaderboardJsonInputProps {
    updateLeaderboard: (leaderboard: Leaderboard) => void;
}

function validateLeaderboard(json: Leaderboard) {
    const requiredFields = ["owner_id", "event", "members"];
    const missingFields = requiredFields.filter((field) => !(field in json));
    if (missingFields.length > 0) {
        throw new Error(
            `JSON is missing the following fields: ${missingFields.join(", ")}`
        );
    }

    for (const member of Object.values(json.members)) {
        validateMember(member);
    }
}

function validateMember(member: Member) {
    const requiredFields = [
        "id",
        "global_score",
        "last_star_ts",
        "name",
        "completion_day_level",
        "local_score",
        "stars",
    ];
    const missingFields = requiredFields.filter((field) => !(field in member));
    if (missingFields.length > 0) {
        throw new Error(
            `Member is missing the following fields: ${missingFields.join(
                ", "
            )}`
        );
    }

    for (const completionDayLevel of Object.values(
        member.completion_day_level
    )) {
        if (!("1" in completionDayLevel)) {
            throw new Error("Completion is missing part 1");
        }

        for (const completion of Object.values(completionDayLevel)) {
            const requiredFields = ["star_index", "get_star_ts"];
            const missingFields = requiredFields.filter(
                (field) => !(field in completion)
            );
            if (missingFields.length > 0) {
                throw new Error(
                    `Completion is missing the following fields: ${missingFields.join(
                        ", "
                    )}`
                );
            }
        }
    }
}

export default function LeaderboardJsonInput({
    updateLeaderboard: setLeaderboard,
}: Readonly<LeaderboardJsonInputProps>) {
    const [filename, setFilename] = React.useState<string | null>(null);

    const [fileState, setFileState] = React.useState<
        | {
              type: "none" | "success";
          }
        | {
              type: "error";
              message: string;
          }
    >({
        type: "none",
    });

    async function handleFileChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const content = await file.text();
        const json: Leaderboard = JSON.parse(content);

        try {
            validateLeaderboard(json);
        } catch (e) {
            if (e instanceof Error) {
                setFileState({ type: "error", message: e.message });
            }
            return;
        }

        setFilename(file.name);
        setFileState({ type: "success" });
        setLeaderboard(json);
    }

    return (
        <div className="flex gap-4 items-center">
            <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<UploadFile />}
            >
                Upload Leaderboard{" "}
                <input
                    type="file"
                    accept=".json"
                    hidden
                    onChange={handleFileChange}
                />
            </Button>
            <HelpButton />
            {filename && <span>{filename}</span>}

            {fileState.type === "none" && (
                <Alert severity="info">
                    Select a JSON leaderboard file to get started.
                </Alert>
            )}

            {fileState.type === "error" && (
                <Alert severity="error">{fileState.message}</Alert>
            )}

            {fileState.type === "success" && (
                <Alert severity="success">
                    Leaderboard loaded successfully.
                </Alert>
            )}
        </div>
    );
}
