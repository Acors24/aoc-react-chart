import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

interface MemberListProps {
    scores: {
        [key: string]: {
            timestamp: number;
            score: number;
        }[];
    };
    setSingleMemberVisibility: (displayName: string, visible: boolean) => void;
    displayNameToColor: {
        [key: string]: string;
    };
}

export default function MemberList({
    scores,
    setSingleMemberVisibility,
    displayNameToColor,
}: Readonly<MemberListProps>) {
    return (
        <FormGroup
            sx={{
                overflowY: "scroll",
                flexWrap: "nowrap",
            }}
        >
            {Object.keys(scores).map((displayName) => (
                <FormControlLabel
                    key={displayName}
                    control={
                        <Checkbox
                            defaultChecked
                            onChange={(e) =>
                                setSingleMemberVisibility(
                                    displayName,
                                    e.target.checked
                                )
                            }
                            sx={{
                                color: "white",
                                "&.Mui-checked": {
                                    color: "white",
                                },
                            }}
                        />
                    }
                    label={displayName}
                    sx={{
                        color: "white",
                        margin: "0.25em 0",
                        backgroundColor: displayNameToColor[displayName],
                        position: "relative",
                        "::before": {
                            position: "absolute",
                            content: '""',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1,
                            borderRadius: "inherit",
                        },
                        "&:hover::before": {
                            backgroundColor: "rgba(0,0,0,0.1)",
                        },
                    }}
                    className="rounded-md"
                />
            ))}
        </FormGroup>
    );
}
