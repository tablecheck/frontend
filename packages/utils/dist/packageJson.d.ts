import type { PackageJson } from 'type-fest';
export declare function getPackageJson(directory?: string): PackageJson;
export declare function detectInstalledVersion(cwd: string, packageName: string, semverVersion: string): string;
declare module 'type-fest' {
    namespace PackageJson {
        interface NonStandardEntryPoints {
            /**
             * Entry file used for generating a bundle using @tablecheck/scripts-library
             */
            entry?: string;
            /**
             * Entry files used for generating multiple bundles using @tablecheck/scripts-library
             */
            entries?: string[];
            /**
             * A list of files/folders that should be included in the build output of @tablecheck/scripts-library
             */
            assets?: string[];
        }
    }
}
export declare function processPackage({ packageProcessor, shouldWriteFile, packageDir, }: {
    packageDir: string;
    packageProcessor: (packageContent: PackageJson, filePath: string) => Promise<PackageJson>;
    shouldWriteFile: boolean;
}): Promise<{
    success: boolean;
    error: string;
} | {
    success: boolean;
    error: Error;
}>;
