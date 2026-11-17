// make.fun's public API: read-only GET, open CORS. Answers are cached per path for the session.
const API = 'https://make.fun/api';
const cache = new Map();
export async function api(path) {
  if (cache.has(path)) return cache.get(path);
  const p = fetch(API + path).then((r) => r.json()).catch(() => null);
  cache.set(path, p);
  return p;
}
export const getBounties = () => api('/competitions?status=open&activity=times');
export const getBounty = (slug) => api('/competitions/' + encodeURIComponent(slug));
export const getLeaderboard = (slug) => api('/competitions/' + encodeURIComponent(slug) + '/leaderboard');
export const getProfile = (handle) => api('/profiles/' + encodeURIComponent(handle));
