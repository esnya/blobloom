export interface WsOptions {
  origin: string;
  secure: boolean;
}

export const deriveWsOptions = (baseUrl = ''): WsOptions => {
  const secure = baseUrl
    ? baseUrl.startsWith('https')
    : typeof window !== 'undefined' && window.location.protocol === 'https:';
  const origin = baseUrl
    ? baseUrl.replace(/^https?:\/\//, '')
    : typeof window !== 'undefined'
      ? window.location.host
      : '';
  return { origin, secure };
};

export const buildWsUrl = (path: string, { origin, secure }: WsOptions): string => {
  const protocol = secure ? 'wss' : 'ws';
  return `${protocol}://${origin}${path}`;
};
