import rollup from 'rollup';
export declare function getBundleInput(cwd: string): string[];
export declare function getBabelPlugin(isEsm?: boolean): rollup.Plugin;
export declare function loadRollupConfig({ packagePath, cwd, bundleEntries, rollupWarnings, shouldBundleDependencies, verbose, }: {
    packagePath: string;
    cwd: string;
    bundleEntries: string[];
    rollupWarnings: (rollup.RollupWarning | string)[];
    shouldBundleDependencies?: boolean;
    verbose?: boolean;
}): rollup.RollupOptions;
