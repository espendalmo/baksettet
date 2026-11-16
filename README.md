# Bak settet

Mitt trommeark for øving og konserter. Her samler jeg settlister, tempo, startsignaler og egne notater til trommesett og perkusjon.

## På scenen

1. Åpne **Settlister**, velg prosjekt og settliste, og legg inn låtene i spille­rekkefølge. Du kan legge inn pauser og spille samme låt flere ganger.
2. Åpne **På scenen**. Første låt vises med startsignal, tempo og spillenotater.
3. Trykk på BPM-feltet for å starte eller stoppe pulsen. **Halvtempo** gjelder til du slår det av. Med pulsen på holder **Spilt · neste** notatene til neste låt i syne.
4. Bruk **Forrige** for å se tilbake, **Angre** hvis du markerer feil, og **Fortsett etter pause** når dere er klare. **Frie forslag** kan velges fra prosjektknappen på scenen.

## Repertoar og sikkerhetskopi

**Rediger repertoar** lagrer endringer på enheten. Ved spillenotatene kan du bytte mellom **Trommesett** og **Perkusjon**. I `songs.json` bruker de henholdsvis `notes` og `cues`, og `percussionNotes` og `percussionCues`.

- **Eksporter alt** lager `bak-settet-data.json` med låter, prosjekter og settlister. Bruk **Importer alt** for å legge inn en slik eksport igjen.
- **Last ned sikkerhetskopi** i **Innstillinger** tar også med innstillinger, favoritter, spillehistorikk og posisjon i settlisten.
- Ved publisering av nye data kan `songs.json` og `projects.json` eksporteres hver for seg. **Hent publiserte data** i appen henter begge. Appen spør før lokale utkast erstattes.

Det medfølgende repertoaret og spillenotatene ligger i `songs.json`, `projects.json` og `seed.js`. Ved publisering følger disse filene med appen.

## Kjør lokalt

```sh
python3 -m http.server 8080
```

Kjør kommandoen i mappen med `index.html` og åpne [vanlig versjon](http://localhost:8080/) eller [beta](http://localhost:8080/beta/). HTML-forhåndsvisningen kan åpnes direkte i en nettleser og lagrer endringer for seg.

## Oppdatering på iPhone

Vanlig versjon og `beta/` kan ligge hver for seg på GitHub Pages. De har separat lokal lagring. Legg den publiserte appen til på hjemskjermen fra Safari og åpne den på nett én gang før bruk frakoblet.

Publiser filene fra samme utgave sammen. Åpne **Innstillinger → Se etter appoppdatering** og velg **Installer oppdatering**. Appen lagrer den lokale tilstanden før den lastes på nytt.

Appen kan lese data fra Gig-settliste v8.0 på samme nettsted og i samme nettleserprofil. Ved flytting til en ny adresse eller enhet bruker jeg **Gjenopprett sikkerhetskopi**.
