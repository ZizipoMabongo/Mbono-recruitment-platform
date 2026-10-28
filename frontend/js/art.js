// Sector illustrations (inline SVG), used on vacancy cards and the landing page
function mbArt(i){
 const G=[
 '<path d="M-28 6v-8a28 28 0 0 1 56 0v8"/><rect x="-35" y="3" width="12" height="22" rx="5" fill="#0f4a33"/><rect x="23" y="3" width="12" height="22" rx="5" fill="#0f4a33"/><path d="M29 25q0 10-16 10h-7"/>',
 '<path d="M-22-32h30l16 16v48h-46z"/><path d="M8-32v16h16M-12-2h24M-12 10h24M-12 22h14"/>',
 '<circle r="12"/><circle r="26"/><path d="M0-37v11M0 26v11M-37 0h11M26 0h11M-26-26l8 8M18 18l8 8M26-26l-8 8M-18 18l-8 8"/>',
 '<path d="M0-26l40 16-40 16-40-16z"/><path d="M-24 0v16c0 8 48 8 48 0V0M40-10v22"/>'];
 const k=i>=0&&i<4?i:1;
 return `<svg viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Sector illustration"><defs><linearGradient id="ag${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9e8dc"/><stop offset="1" stop-color="#9bbaa1"/></linearGradient></defs><rect width="200" height="110" fill="url(#ag${k})"/><circle cx="170" cy="20" r="34" fill="#fff" opacity=".18"/><circle cx="24" cy="100" r="44" fill="#0f4a33" opacity=".1"/><g transform="translate(100 56)" fill="none" stroke="#0f4a33" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${G[k]}</g></svg>`}
