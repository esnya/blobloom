export const appSettings = {
  repo: Symbol('repo'),
  branch: Symbol('branch'),
  ignore: Symbol('ignore'),
} as const;

export type AppSettingKey = typeof appSettings[keyof typeof appSettings];

export interface AppSettings {
  [appSettings.repo]?: string;
  [appSettings.branch]?: string;
  [appSettings.ignore]?: string[];
}
