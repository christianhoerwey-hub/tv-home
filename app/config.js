// Kacheln auf dem Homescreen. Reihenfolge = Reihenfolge am TV.
// id: Tizen-App-ID (am TV geprüft am 2026-10-26). Sonderfall "tv": beendet den Homescreen,
// der TV fällt dann auf die letzte Quelle (Live-TV/HDMI) zurück.
window.HOME_CONFIG = {
  name: 'Home',
  apps: [
    { id: 'tv',            name: 'Fernsehen',   short: 'TV', color: '#3a7bd5' },
    { id: '3201907018807', name: 'Netflix',     short: 'N',  color: '#e50914' },
    { id: '111299001912',  name: 'YouTube',     short: 'YT', color: '#ff0033' },
    { id: '3201910019365', name: 'Prime Video', short: 'P',  color: '#00a8e1' },
    { id: '3201901017640', name: 'Disney+',     short: 'D+', color: '#113ccf' },
    { id: '3201807016597', name: 'Apple TV',    short: 'tv', color: '#333333' },
    { id: '3201512006963', name: 'Plex',        short: 'PX', color: '#e5a00d' },
    { id: '3201606009684', name: 'Spotify',     short: 'S',  color: '#1db954' }
  ],
  // Eigene Hintergrundbilder (URLs) können hier ergänzt werden, z.B.
  // { name: 'Berge', image: 'https://…/berge.jpg' }
  backgrounds: [
    { name: 'Nordlicht', css: 'linear-gradient(135deg,#0f2027,#203a43 45%,#2c5364)', anim: 'aurora' },
    { name: 'Abend',     css: 'linear-gradient(135deg,#2b1055,#7597de)',             anim: 'aurora' },
    { name: 'Glut',      css: 'linear-gradient(135deg,#1f1c2c,#928dab)',             anim: '' },
    { name: 'Wald',      css: 'linear-gradient(135deg,#0b3d2e,#1e5631 50%,#4c9a2a)', anim: 'aurora' },
    { name: 'Schwarz',   css: '#000',                                                anim: '' }
  ]
};
