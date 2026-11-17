import { getBounties, getBounty, getLeaderboard, getProfile } from './api.js';
import { board, bounty, leaderboard, profile } from './views.js';

let currentRouteToken = 0;

async function router() {
  const token = ++currentRouteToken;
  window.__shotReady = false;

  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = '<div class="loading-state"><p>Loading…</p></div>';

  const hash = window.location.hash.slice(1) || '/';
  const cleanHash = hash.startsWith('/') ? hash : '/' + hash;

  try {
    const lbMatch = cleanHash.match(/^\/bounty\/([^/]+)\/leaderboard$/);
    if (lbMatch) {
      const slug = decodeURIComponent(lbMatch[1]);
      document.title = 'Leaderboard - make.fun';
      const data = await getLeaderboard(slug);
      if (token !== currentRouteToken) return;
      if (data?.competition?.title) {
        document.title = `${data.competition.title} Leaderboard - make.fun`;
      }
      app.innerHTML = leaderboard(data, slug);
      return;
    }

    const bountyMatch = cleanHash.match(/^\/bounty\/([^/]+)$/);
    if (bountyMatch) {
      const slug = decodeURIComponent(bountyMatch[1]);
      document.title = 'Bounty - make.fun';
      const data = await getBounty(slug);
      if (token !== currentRouteToken) return;
      if (data?.title) {
        document.title = `${data.title} - make.fun`;
      }
      app.innerHTML = bounty(data);
      return;
    }

    const profileMatch = cleanHash.match(/^\/profile\/([^/]+)$/);
    if (profileMatch) {
      const handle = decodeURIComponent(profileMatch[1]);
      document.title = `@${handle} - make.fun`;
      const data = await getProfile(handle);
      if (token !== currentRouteToken) return;
      app.innerHTML = profile(data, handle);
      return;
    }

    // Default route: #/
    document.title = 'make.fun - Active Bounties';
    const data = await getBounties();
    if (token !== currentRouteToken) return;
    app.innerHTML = board(data);
  } catch (err) {
    if (token !== currentRouteToken) return;
    console.error('Route error:', err);
    app.innerHTML = `<div class="error-state"><p>Failed to load data. Please try again.</p></div>`;
  } finally {
    if (token === currentRouteToken) {
      window.__shotReady = true;
    }
  }
}

window.addEventListener('hashchange', router);

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', router);
} else {
  router();
}
