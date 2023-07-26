import { execSync } from 'child_process';

export function getLatestVersion(dependency: string) {
  return execSync(`npm show ${dependency} version`).toString().trim();
}

export function getLatestVersions(dependencies: string[]) {
  return dependencies.reduce(
    (result, dependency) => ({
      ...result,
      [dependency]: getLatestVersion(dependency),
    }),
    {} as Record<string, string>,
  );
}
