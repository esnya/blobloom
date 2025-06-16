export const buildWsUrl = (path: string, baseUrl = ''): string => {
  const secure = baseUrl
    ? baseUrl.startsWith('https')
    : typeof window !== 'undefined' && window.location.protocol === 'https:';
  const protocol = secure ? 'wss' : 'ws';
  const origin = baseUrl
    ? baseUrl.replace(/^https?:\/\//, '')
    : typeof window !== 'undefined'
      ? window.location.host
      : '';
  return `${protocol}://${origin}${path}`;
};
