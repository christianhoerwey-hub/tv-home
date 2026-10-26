# tv-home

Eigener, werbefreier Homescreen für einen Samsung Tizen TV, als [TizenBrew](https://github.com/reisxd/TizenBrew)-App-Modul.

- 3 Layouts (Spotlight, Raster, Minimal), 5 Hintergründe, Uhr an/aus
- Fernbedienung: Pfeile + OK, **Rot** = Layout, **Grün** = Hintergrund, **Blau** = Einstellungen
- Kacheln und App-IDs in `app/config.js`

Installation: in TizenBrew „GitHub-Modul hinzufügen“ → `christianhoerwey-hub/tv-home@2.0.0`. Die feste Version enthält nur Lader und Hintergrunddienst; Aussehen und Kacheln (`app/style.css`, `app/config.js`, `app/app.js`) kommen beim Start immer vom neuesten Commit auf `main`. Änderungen daran also einfach pushen, kein neuer Tag nötig. Nur wenn `package.json`, `service.js` oder `app/index.html` sich ändern, braucht es einen neuen Tag und den neuen Modulnamen.
