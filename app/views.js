import { esc, money, date, timeLeft, num } from './format.js';

export function board(data) {
  const items = (data && data.items) || [];
  const cards = items.map(b => {
    const slug = b.slug || '';
    const title = esc(b.title || 'Untitled');
    const pot = money(b.potUsd ?? b.rewardAmount);
    const entryFee = (b.entryFeeUsd != null || b.entryFee != null)
      ? money(b.entryFeeUsd ?? b.entryFee)
      : null;
    const time = timeLeft(b.deadline ?? b.endsAt);
    const count = num(b.entryCount ?? b.entriesCount ?? b.numEntries ?? 0);

    return `
      <a class="bounty-card" href="#/bounty/${encodeURIComponent(slug)}">
        <h2 class="bounty-card-title">${title}</h2>
        <div class="bounty-card-meta">
          <div class="meta-item"><span class="meta-label">Pot</span><span class="meta-value pot">${esc(pot)}</span></div>
          ${entryFee ? `<div class="meta-item"><span class="meta-label">Fee</span><span class="meta-value">${esc(entryFee)}</span></div>` : ''}
          <div class="meta-item"><span class="meta-label">Time</span><span class="meta-value">${esc(time)}</span></div>
          <div class="meta-item"><span class="meta-label">Entries</span><span class="meta-value">${esc(count)}</span></div>
        </div>
      </a>
    `;
  }).join('');

  return `
    <div class="board-view">
      <header class="page-header">
        <h1>Active Bounties</h1>
        <p class="subtitle">Explore open challenges and compete on make.fun</p>
      </header>
      <div class="bounty-grid">
        ${cards || '<p class="empty-state">No open bounties found.</p>'}
      </div>
    </div>
  `;
}

export function bounty(b) {
  if (!b) return `<div class="bounty-view"><p class="empty-state">Bounty not found.</p></div>`;
  const slug = encodeURIComponent(b.slug || '');
  const title = esc(b.title || 'Untitled Bounty');
  const summary = b.summary ? `<p class="bounty-summary">${esc(b.summary)}</p>` : '';
  const reward = money(b.potUsd ?? b.rewardAmount);
  const fee = (b.entryFeeUsd != null || b.entryFee != null) ? money(b.entryFeeUsd ?? b.entryFee) : 'Free';
  const deadline = date(b.deadline ?? b.endsAt);
  const entries = num(b.entryCount ?? b.entriesCount ?? b.numEntries ?? 0);
  const status = esc(b.status || 'open');
  const description = b.description ? `<div class="bounty-description"><p>${esc(b.description)}</p></div>` : '';

  return `
    <div class="bounty-view">
      <nav class="breadcrumb"><a href="#/">← Back to bounties</a></nav>
      <header class="bounty-header">
        <h1 class="bounty-title">${title}</h1>
        ${summary}
      </header>
      <div class="bounty-meta-card">
        <table class="data-table">
          <tbody>
            <tr><th>Reward</th><td><span class="pot">${esc(reward)}</span></td></tr>
            <tr><th>Entry fee</th><td>${esc(fee)}</td></tr>
            <tr><th>Deadline</th><td>${esc(deadline)} (${esc(timeLeft(b.deadline ?? b.endsAt))})</td></tr>
            <tr><th>Entries</th><td>${esc(entries)}</td></tr>
            <tr><th>Status</th><td><span class="badge status-${status}">${status}</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="bounty-actions">
        <a class="btn btn-primary" href="#/bounty/${slug}/leaderboard">View Leaderboard</a>
      </div>
      ${description}
    </div>
  `;
}

export function leaderboard(lb, slug) {
  const compSlug = encodeURIComponent(slug || '');
  const title = esc(lb?.competition?.title || lb?.title || 'Leaderboard');
  const visibleCols = (lb?.columns || []).filter(c => !c.hidden);
  const entries = (lb?.entries || []).slice(0, 100);

  const headerCells = visibleCols.map(col => `<th>${esc(col.title)}</th>`).join('');

  const rowHtml = entries.map(e => {
    const rank = Number(e.rank);
    const isTop = rank >= 1 && rank <= 3;
    const handle = e.handle || (e.user && e.user.handle) || (e.profile && e.profile.handle) || '';
    const colCells = visibleCols.map(col => {
      const val = (e.display && e.display[col.key] != null)
        ? e.display[col.key]
        : (e.values && e.values[col.key] != null)
          ? e.values[col.key]
          : '';
      return `<td>${esc(val)}</td>`;
    }).join('');

    return `
      <tr class="${isTop ? 'top' : ''}">
        <td class="col-rank">#${esc(e.rank)}</td>
        <td class="col-handle"><a href="#/profile/${encodeURIComponent(handle)}">@${esc(handle || 'anonymous')}</a></td>
        ${colCells}
      </tr>
    `;
  }).join('');

  return `
    <div class="leaderboard-view">
      <nav class="breadcrumb"><a href="#/bounty/${compSlug}">← Back to bounty</a></nav>
      <header class="page-header">
        <h1>${title}</h1>
        <p class="subtitle">Leaderboard & rankings</p>
      </header>
      <div class="table-container">
        <table class="data-table leaderboard-table">
          <thead>
            <tr>
              <th class="col-rank">Rank</th>
              <th class="col-handle">Competitor</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>
            ${rowHtml || '<tr><td colspan="10" class="empty-state">No entries yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function profile(p, handle) {
  const displayHandle = (p && p.handle) || handle || 'Anonymous';
  const bio = (p && p.bio) ? `<p class="profile-bio">${esc(p.bio)}</p>` : '';
  const avatarUrl = p && (p.picture || p.avatar);
  const avatar = avatarUrl
    ? `<img class="profile-avatar" src="${esc(avatarUrl)}" alt="${esc(displayHandle)}" crossorigin="anonymous" />`
    : `<div class="profile-avatar-placeholder">${esc(displayHandle.slice(0, 2).toUpperCase())}</div>`;

  let entriesHtml = '';
  if (p && Array.isArray(p.entries) && p.entries.length > 0) {
    const rows = p.entries.map(e => {
      const compTitle = esc(e.competitionTitle || e.competitionSlug || e.title || 'Bounty');
      const compSlug = encodeURIComponent(e.competitionSlug || e.slug || '');
      const rank = e.rank ? `#${esc(e.rank)}` : '-';
      const score = e.score != null ? esc(e.score) : '-';
      return `
        <tr>
          <td><a href="#/bounty/${compSlug}">${compTitle}</a></td>
          <td>${rank}</td>
          <td>${score}</td>
        </tr>
      `;
    }).join('');
    entriesHtml = `
      <div class="profile-entries">
        <h2>Competition Entries</h2>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr><th>Competition</th><th>Rank</th><th>Score</th></tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  return `
    <div class="profile-view">
      <nav class="breadcrumb"><a href="#/">← Back to bounties</a></nav>
      <div class="profile-header">
        ${avatar}
        <div class="profile-info">
          <h1 class="profile-handle">@${esc(displayHandle)}</h1>
          ${bio}
        </div>
      </div>
      ${entriesHtml}
    </div>
  `;
}
