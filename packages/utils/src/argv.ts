import minimist from 'minimist';

export function getArgv(
  args: Omit<minimist.Opts, 'boolen'> & {
    boolean?: string[];
    string?: string[];
  } = {},
) {
  if (!args.boolean || args.boolean.indexOf('verbose') === -1) {
    args.boolean = [...(args.boolean ?? []), 'verbose'];
  }
  if (!args.string || args.string.indexOf('package') === -1) {
    args.string = [...(args.string ?? []), 'package'];
  }
  args.default = {
    ...(args.default ?? {}),
    // default to true if github debugger is turned on
    verbose: !!process.env.ACTIONS_STEP_DEBUG,
  };
  const unknownArgs: string[] = [];
  args.unknown ??= (arg) => {
    unknownArgs.push(arg);
    return false;
  };
  const argv = minimist(process.argv.slice(2), args);
  argv._args = unknownArgs;
  return argv;
}
