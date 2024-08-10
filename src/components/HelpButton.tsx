import { QuestionMark } from "@mui/icons-material";
import { Button, Link, Popover } from "@mui/material";
import React from "react";

export default function HelpButton() {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
        null
    );

    const open = Boolean(anchorEl);

    return (
        <>
            <Button
                variant="outlined"
                onClick={(event) => setAnchorEl(event.currentTarget)}
            >
                <QuestionMark />
            </Button>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >
                <div className="p-4">
                    <p className="pb-2">
                        The JSON file should be exported from the Advent of Code
                        leaderboard page.
                    </p>
                    <ol className="list-decimal list-inside">
                        <li>
                            Go to the private leaderboard page (
                            <Link href="https://adventofcode.com/2023/leaderboard/private">
                                https://adventofcode.com/2023/leaderboard/private
                            </Link>
                            ).
                        </li>
                        <li>Select one of your private leaderboards.</li>
                        <li>Click [API], then [JSON] buttons.</li>
                        <li>Download the file.</li>
                        <li>Upload the downloaded file here.</li>
                    </ol>
                </div>
            </Popover>
        </>
    );
}
