# Bak settet

Trommeark og settlister for livebruk. Pakken inneholder de 46 låtene fra Gig-settliste v8.0 med opprinnelige noter, tempo, startsignaler og merkelapper.

## Før konserten

1. Åpne **Settlister**, velg prosjekt og settliste, og legg inn låtene i spille­rekkefølge. Du kan legge inn pauser og spille samme låt flere ganger.
2. Åpne **På scenen**. Første låt vises med startsignal, tempo og spillenotater.
3. Bruk **Spilt · neste** nederst. Hvis settlisten har en pause, blir pausen stående til du velger **Fortsett etter pause**. **Forrige** viser låten igjen og lar deg gå tilbake til den aktive plassen. **Angre** ligger i meldingen etter at du markerer en låt, og i **Innstillinger**.
4. Trykk på prosjektet øverst på scenen for å bytte til **Frie forslag**. De tre forslagene tar hensyn til favoritter og de fem siste låtene, med variasjon i artist, tempo, energi og merkelapper.
5. Trykk på BPM-feltet for å starte eller stoppe pulsen. **Halvtempo** halverer BPM med ett trykk og gjelder til du slår det av. 4/4-aksent, skjermlås, lys/mørk visning og automatisk neste ligger i **Innstillinger**.

Velg **Trommesett** eller **Perkusjon** ved spillenotatene på scenen. Appen husker valget når du går videre til neste låt. Bruk **Rediger repertoar** til å legge inn egne notater for hvert instrument, med valgfrie felt for **Inn**, **Underveis** og **Avslutning**. I `songs.json` ligger trommesettnotater i `notes` og `cues`. Perkusjon bruker `percussionNotes` og `percussionCues`. Redigeringen lagres på denne enheten.

**Repertoar** har søk og filtre for blant annet spilte låter, favoritter, tempo og «Tell opp». Søket finner notater for begge instrumentene.

## Prøv lokalt

Pakk ut ZIP-filen. Kjør denne kommandoen i mappen med `index.html`.

```sh
python3 -m http.server 8080
```

Åpne [vanlig versjon](http://localhost:8080/) eller [beta](http://localhost:8080/beta/). Den separate HTML-forhåndsvisningen åpner med et prøvesett når du åpner den direkte i en nettleser. Den lagrer endringer separat og fungerer uten server. Appinstallasjon, oppdateringssjekk og henting av publiserte JSON-filer krever den serverbaserte versjonen.

## Erstatt Gig-settliste v8.0

- Ta en sikkerhetskopi i den gamle appen. Behold dine publiserte `songs.json` og `projects.json` hvis du har oppdatert dem siden v8.0-pakken.
- Legg de vanlige appfilene i samme mappe som den eksisterende appen. `index.html`, `editor.html`, `manifest.webmanifest` og `service-worker.js` beholder plasseringen sin. `beta/` legges i en undermappe. Kopier også egne publiserte data dit hvis du ønsker samme startrepertoar i beta.
- Åpne eller last inn den vanlige appen på nytt etter publisering. Den leser v8-data fra samme nettleserprofil og nettsted. Flytter du appen til et annet nettsted eller en annen enhet, bruker du **Gjenopprett sikkerhetskopi**.
- På iPhone kan du legge den publiserte appen på Hjem-skjermen fra Safari. Åpne den på nett én gang og vent til den er lastet før du bruker den frakoblet.

## Publisering og oppdatering

Vanlig versjon og `beta/` kan publiseres separat på GitHub Pages eller annen statisk HTTPS-hosting. De har separat lokal lagring og egne service worker-cacher. Beta viser den publiserte versjonen ved å lese `../version.json`.

Appen klargjør en komplett utgave i bakgrunnen. Åpne **Innstillinger → Se etter appoppdatering** for å sjekke manuelt. Knappen **Installer oppdatering** åpner den nye utgaven etter at den lokale tilstanden er lagret. En åpen scenevisning lastes bare inn på nytt når du selv installerer. Bruk **Hent publiserte data** for å oppdatere repertoaret fra JSON-filene separat.

Ved en ny apputgave øker du versjonsnummeret i `index.html` (`data-version`), `version.json` og `service-worker.js` i kanalen du publiserer. Publiser alle appfilene i samme leveranse. I vanlig versjon er kanalnavnet `stable`, og i `beta/` er det `beta`.

Når du bare publiserer endringer i repertoaret, eksporter `songs.json` og `projects.json` fra redigeringen og erstatt dem på serveren. **Hent publiserte data** henter begge filene sammen. Appen ber om bekreftelse før lokale utkast erstattes. En sikkerhetskopi inkluderer også favoritter, historikk og posisjon i settlistene.
