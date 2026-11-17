export function esc(v) {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function money(v) {
  if (v == null || v === '' || isNaN(Number(v))) return '$0';
  const n = Number(v);
  return '$' + n.toLocaleString('en-US', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function date(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

export function timeLeft(iso) {
  if (!iso) return 'ended';
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'ended';
  const totalMins = Math.floor(diff / 60000);
  const totalHours = Math.floor(totalMins / 60);
  const days = Math.floor(totalHours / 24);
  if (days > 0) {
    const remHours = totalHours % 24;
    return `${days}d ${remHours}h left`;
  }
  if (totalHours > 0) {
    const remMins = totalMins % 60;
    return `${totalHours}h ${remMins}m left`;
  }
  return `${Math.max(1, totalMins)}m left`;
}

export function num(v) {
  if (v == null || v === '' || isNaN(Number(v))) return '0';
  return Number(v).toLocaleString('en-US');
}
