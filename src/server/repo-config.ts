import express from 'express';
import path from 'path';
import fs from 'fs';
import { appSettings } from './app-settings';
import { defaultIgnore } from './ignore-defaults';

export const repoDir = (app: express.Application): string =>
  path.resolve((app.get(appSettings.repo.description!) as string | undefined) ?? process.cwd());

export const resolveRepoDir = (app: express.Application): string => {
  const dir = repoDir(app);
  if (!fs.existsSync(path.join(dir, '.git'))) {
    throw new Error(`${dir} is not a git repository.`);
  }
  return dir;
};

export const ignorePatterns = (app: express.Application): string[] =>
  (app.get(appSettings.ignore.description!) as string[] | undefined) ?? [...defaultIgnore];
