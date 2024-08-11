type FileState = {
    type: "none" | "success";
} | {
    type: "error";
    message: string;
};

export default FileState;