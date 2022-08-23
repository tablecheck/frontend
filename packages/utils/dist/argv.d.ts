import minimist from 'minimist';
export declare function getArgv(args?: Omit<minimist.Opts, 'boolen'> & {
    boolean?: string[];
    string?: string[];
}): minimist.ParsedArgs;
