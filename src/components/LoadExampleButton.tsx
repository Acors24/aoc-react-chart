import { Button } from "@mui/material";
import exampleJson from "../assets/example.json?raw";

interface LoadExampleButtonProps {
    processFile: (file: File) => void;
}

export default function LoadExampleButton({ processFile }: Readonly<LoadExampleButtonProps>) {
    const loadExample = async () => {
        const blob = new Blob([exampleJson], { type: "application/json" });
        const fileToProcess = new File([blob], "example.json");
        processFile(fileToProcess);
    };

    return (
        <Button onClick={loadExample} variant="outlined">
            Load Example
        </Button>
    );
}