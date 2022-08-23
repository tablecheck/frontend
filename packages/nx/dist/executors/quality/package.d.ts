export declare function packageCheck({ directory, shouldFix, }: {
    directory: string;
    shouldFix: boolean;
}): Promise<{
    success: boolean;
    error: string;
} | {
    success: boolean;
    error: Error;
}>;
