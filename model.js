(() => {
  "use strict";

  const cueFields = [
    ["intro", "Inn"],
    ["during", "Underveis"],
    ["ending", "Avslutning"]
  ];
  const cueTypes = [
    ["TELL", "Tell opp", "count", "sticks"],
    ["RETT PÅ", "Rett på", "direct", "arrowRight"],
    ["GITAR", "Gitar starter", "other", "music"],
    ["BASS", "Bass starter", "other", "music"],
    ["GITAR/BASS", "Gitar / bass starter", "other", "music"],
    ["HH", "Hi-hat starter", "drums", "drum"],
    ["BJELLE", "Bjelle starter", "drums", "drum"],
    ["TROMMER", "Trommer starter", "drums", "drum"]
  ];
  const object = value => value && typeof value === "object" && !Array.isArray(value);
  const str = value => typeof value === "string" ? value : "";
  const list = value => Array.isArray(value) ? value : [];
  const strings = value => list(value).filter(item => typeof item === "string" && item);
  const key = value => typeof value === "string" && value.trim() && !Object.hasOwn(Object.prototype, value) && value !== "prototype";
  const projectId = id => id === "pubband" ? "kes" : id;
  const newId = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2)}`;
  const sortName = (a, b) => a.localeCompare(b, "nb", { sensitivity: "base" });

  function norm(value) {
    return String(value ?? "").toLocaleLowerCase("nb")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/æ/g, "ae").replace(/ø/g, "o").replace(/[’‘]/g, "'");
  }

  function uniqueSlug(value, taken) {
    const base = norm(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "navn";
    let result = base;
    for (let i = 2; !key(result) || taken.has(result); i++) result = `${base}-${i}`;
    return result;
  }

  function startCue(value) {
    const label = str(value).trim();
    if (!label) return null;
    const alias = norm(label).replace(/\s*\/\s*/g, "/");
    const match = cueTypes.find(([code, name]) => norm(code) === alias || norm(name).replace(/\s*\/\s*/g, "/") === alias);
    return match ? { label: match[1], tone: match[2], icon: match[3] } : { label, tone: "other", icon: "flag" };
  }

  function normalizeDataset(raw, { strict = false } = {}) {
    if (!Array.isArray(raw?.songs) || !Array.isArray(raw?.projects)) {
      throw new Error("Dataene må inneholde låter og prosjekter.");
    }

    const projectIds = new Set();
    const projects = [];
    for (const input of raw.projects) {
      const id = projectId(input?.id);
      const name = input?.id === "pubband" ? "KES" : str(input?.name).trim();
      if (!key(id) || !name || projectIds.has(id)) {
        if (strict) throw new Error(`Ugyldig eller duplisert prosjekt: ${name || id || "uten navn"}.`);
        continue;
      }
      if (strict && input.setlists != null && !Array.isArray(input.setlists)) {
        throw new Error(`Settlistene i «${name}» må være en liste.`);
      }
      projectIds.add(id);
      projects.push({ ...input, id, name, setlists: list(input.setlists) });
    }
    if (!projects.length) {
      projects.push({ id: "kes", name: "KES", setlists: [] });
      projectIds.add("kes");
    }

    const songIds = new Set();
    const reservedSongIds = new Set(raw.songs.map(song => song?.id).filter(key));
    const songs = [];
    for (const input of raw.songs) {
      const title = str(input?.title).trim();
      const artist = str(input?.artist).trim();
      if (!title || (strict && !artist)) {
        if (strict) throw new Error(`En låt mangler ${title ? "artist" : "tittel"}.`);
        continue;
      }
      if (strict && input.id != null && (!key(input.id) || songIds.has(input.id))) {
        throw new Error(`Ugyldig eller duplisert låt-ID for «${title}».`);
      }
      const id = key(input.id) && !songIds.has(input.id)
        ? input.id
        : uniqueSlug(`${title} ${artist}`, new Set([...reservedSongIds, ...songIds]));
      songIds.add(id);
      const bpm = Number(input.bpm);
      if (strict && input.bpm != null && (!Number.isFinite(bpm) || bpm <= 0)) {
        throw new Error(`Ugyldig BPM for «${title}».`);
      }
      if (strict && input.projects != null && !Array.isArray(input.projects)) {
        throw new Error(`Prosjektene for «${title}» må være en liste.`);
      }
      const memberships = Array.isArray(input.projects) ? strings(input.projects).map(projectId) : [projects[0].id];
      if (strict && memberships.some(pid => !projectIds.has(pid))) {
        throw new Error(`«${title}» tilhører et ukjent prosjekt.`);
      }
      const cues = Object.fromEntries(cueFields
        .map(([field]) => [field, str(input.cues?.[field]).trim()])
        .filter(([, value]) => value));
      const song = {
        ...input, id, title, artist, bpm: Number.isFinite(bpm) && bpm > 0 ? bpm : null,
        start: str(input.start), energy: str(input.energy), notes: str(input.notes),
        tags: [...new Set(strings(input.tags).map(tag => tag.trim()).filter(Boolean))],
        projects: [...new Set(memberships.filter(pid => projectIds.has(pid)))]
      };
      if (Object.keys(cues).length) song.cues = cues;
      else delete song.cues;
      songs.push(song);
    }

    for (const project of projects) {
      const usedLists = new Set();
      project.setlists = project.setlists.flatMap(input => {
        if (!key(input?.id) || usedLists.has(input.id) || !str(input.name).trim()) {
          if (strict) throw new Error(`Ugyldig eller duplisert settliste i «${project.name}».`);
          return [];
        }
        if (strict && input.items != null && !Array.isArray(input.items)) {
          throw new Error(`Låtene i «${input.name}» må være en liste.`);
        }
        usedLists.add(input.id);
        const entries = list(input.items).map(item => typeof item === "string" ? { type: "song", songId: item } : item);
        const reserved = new Set(entries.map(item => item?.entryId).filter(key));
        const usedEntries = new Set();
        const occurrences = new Map();
        const items = entries.flatMap(item => {
          const pause = item?.type === "pause";
          if (!pause && !songIds.has(item?.songId)) {
            if (strict) throw new Error(`«${input.name}» viser til en ukjent låt (${item?.songId || "ukjent ID"}).`);
            return [];
          }
          const label = str(item.label).trim() || "Settpause";
          const identity = pause ? `pause:${label}` : `song:${item.songId}`;
          let count = (occurrences.get(identity) || 0) + 1;
          let entryId = item.entryId;
          if (!key(entryId) || usedEntries.has(entryId)) {
            entryId = `${identity}:${count}`;
            while (reserved.has(entryId) || usedEntries.has(entryId)) entryId = `${identity}:${++count}`;
          }
          occurrences.set(identity, count);
          usedEntries.add(entryId);
          return [{ ...item, entryId, type: pause ? "pause" : "song", ...(pause ? { label } : {}) }];
        });
        return [{ ...input, items }];
      });
      if (!project.setlists.length) project.setlists.push({ id: "standard", name: "Standard", items: [] });
    }
    return { songs, projects };
  }

  function safeMap(raw, valueOf = value => value) {
    const map = Object.create(null);
    if (!object(raw)) return map;
    for (const [id, value] of Object.entries(raw)) {
      if (key(id)) map[id] = valueOf(value);
    }
    return map;
  }

  function projectMap(raw, valueOf) {
    const map = safeMap(raw, valueOf);
    if (Object.hasOwn(map, "pubband") && !Object.hasOwn(map, "kes")) map.kes = map.pubband;
    delete map.pubband;
    return map;
  }

  function readSession(raw, dataset) {
    raw = object(raw) ? raw : {};
    const state = {
      projectState: projectMap(raw.projectState, value => ({
        played: [...new Set(strings(value?.played))],
        history: strings(value?.history),
        favorites: [...new Set(strings(value?.favorites))]
      })),
      setNoByProject: projectMap(raw.setNoByProject, value => Math.max(1, Math.floor(Number(value) || 1))),
      setStartsByProject: projectMap(raw.setStartsByProject, value => list(value)
        .map(n => Math.max(0, Math.floor(Number(n) || 0)))),
      activeSongByProject: projectMap(raw.activeSongByProject, value => str(value) || null),
      activeSetlistByProject: projectMap(raw.activeSetlistByProject, value => str(value) || null),
      setRuns: projectMap(raw.setRuns, value => safeMap(value, run => ({
        done: [...new Set(strings(run?.done))],
        active: str(run?.active) || null,
        last: str(run?.last) || null,
        hold: run?.hold === true
      })))
    };
    if (object(raw.setRuns)) return state;

    if (!Object.keys(state.projectState).length && Array.isArray(raw.played) && dataset.projects.length) {
      const id = dataset.projects[0].id;
      state.projectState[id] = { played: strings(raw.played), history: strings(raw.history ?? raw.played), favorites: strings(raw.favorites) };
      state.setNoByProject[id] = Math.max(1, Number(raw.setNo) || 1);
    }

    for (const project of dataset.projects) {
      const played = state.projectState[project.id]?.played || [];
      const active = state.activeSongByProject[project.id];
      if (!played.length && !active) continue;
      const runs = state.setRuns[project.id] = Object.create(null);
      for (const set of project.setlists) {
        const marked = new Set(played);
        const done = set.items.filter(item => item.type === "song" && marked.delete(item.songId)).map(item => item.entryId);
        const activeItem = set.items.find(item => item.type === "song" && item.songId === active && !done.includes(item.entryId));
        const last = done.at(-1);
        const reached = Math.max(set.items.indexOf(activeItem), set.items.findIndex(row => row.entryId === last));
        for (const item of set.items.slice(0, Math.max(0, reached))) {
          if (item.type === "pause") done.push(item.entryId);
        }
        runs[set.id] = { done, active: activeItem?.entryId || null, last: null, hold: false };
      }
    }
    return state;
  }

  function projectState(state, id) {
    return state.projectState[id] ||= { played: [], history: [], favorites: [] };
  }

  function setRun(state, pid, sid) {
    const runs = state.setRuns[pid] ||= Object.create(null);
    return runs[sid] ||= { done: [], active: null, last: null, hold: false };
  }

  function readSettings(raw = {}) {
    return {
      theme: raw?.theme === "light" ? "light" : "dark",
      mode: raw?.mode === "free" ? "free" : "fixed",
      autoNext: raw?.autoNext !== false,
      wakeEnabled: raw?.wakeEnabled !== false,
      pulseHalf: raw?.pulseHalf === true,
      pulseAccent: raw?.pulseAccent !== false,
      sceneNotesVisible: raw?.sceneNotesVisible !== false
    };
  }

  function songSearch(songs, query) {
    const words = norm(query).trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [...songs].sort((a, b) => sortName(a.title, b.title));
    const phrase = words.join(" ");
    return songs.map(song => {
      const title = norm(song.title);
      const artist = norm(song.artist);
      const haystack = norm([
        song.title, song.artist, song.bpm ? `${song.bpm} BPM` : "", song.start,
        startCue(song.start)?.label, song.energy, ...song.tags, song.notes, ...Object.values(song.cues || {})
      ].join(" "));
      const score = title === phrase ? 100 : title.startsWith(phrase) ? 80
        : artist.startsWith(phrase) ? 65 : title.includes(phrase) ? 50 : artist.includes(phrase) ? 40 : 25;
      return { song, score, match: words.every(word => haystack.includes(word)) };
    }).filter(hit => hit.match).sort((a, b) => b.score - a.score || sortName(a.song.title, b.song.title)).map(hit => hit.song);
  }

  function bpmBand(bpm) {
    if (!bpm) return "ukjent";
    return bpm < 90 ? "rolig" : bpm < 120 ? "middels" : "rask";
  }

  // The weighted random draw from Gig-settliste. Use the five latest songs in this project.
  function suggestionScore(song, recent, favorite) {
    let score = Math.random() * 1.5 + (favorite ? 4 : 0);
    const last = recent.at(-1);
    if (last) {
      score += song.artist !== last.artist ? 4 : -9;
      score += bpmBand(song.bpm) !== bpmBand(last.bpm) ? 1.75 : -1;
      score -= song.tags.filter(tag => last.tags.includes(tag)).length * 1.4;
      if (song.energy !== last.energy) score += 1.25;
    }
    score -= recent.filter(item => item.artist === song.artist).length * 3.5;
    score -= recent.filter(item => bpmBand(item.bpm) === bpmBand(song.bpm)).length * 0.7;
    score -= recent.filter(item => item.energy === song.energy).length * 0.9;
    for (const tag of song.tags) score -= recent.filter(item => item.tags.includes(tag)).length * 0.55;
    const lastThree = recent.slice(-3);
    if (lastThree.length === 3 && lastThree.every(item => item.energy === lastThree[0].energy)) {
      score += song.energy !== lastThree[0].energy ? 3.5 : -3.5;
    }
    const lastTwo = recent.slice(-2);
    if (lastTwo.length === 2 && lastTwo.every(item => item.energy === "rolig")) {
      score += song.energy === "høy" ? 4 : song.energy === "middels" ? 2.5 : -4;
    }
    if (lastTwo.length === 2 && lastTwo.every(item => item.energy === "høy")) {
      score += song.energy === "middels" ? 2.5 : song.energy === "rolig" ? 1.5 : -1.5;
    }
    return score;
  }

  function suggestionReason(song, recent, favorite) {
    const last = recent.at(-1);
    const lastTwo = recent.slice(-2);
    return [
      favorite && "Favoritt",
      last && song.artist !== last.artist && "Ny artist",
      last && bpmBand(song.bpm) !== bpmBand(last.bpm) && "Tempo-variasjon",
      last && song.energy !== last.energy && "Energi-variasjon",
      lastTwo.length === 2 && lastTwo.every(item => item.energy === "rolig") && song.energy !== "rolig" && "Løfter energien",
      lastTwo.length === 2 && lastTwo.every(item => item.energy === "høy") && song.energy !== "høy" && "Gir luft"
    ].filter(Boolean).slice(0, 3);
  }

  function suggest(songs, allSongs, state, excludeId) {
    const map = new Map(allSongs.map(song => [song.id, song]));
    const recent = state.history.slice(-5).map(id => map.get(id)).filter(Boolean);
    return songs.filter(song => song.id !== excludeId && !state.played.includes(song.id))
      .map(song => {
        const favorite = state.favorites.includes(song.id);
        return { song, score: suggestionScore(song, recent, favorite), reasons: suggestionReason(song, recent, favorite) };
      }).sort((a, b) => b.score - a.score).slice(0, 3);
  }

  window.DrumModel = {
    cueFields, cueTypes, norm, uniqueSlug, newId, startCue, normalizeDataset, readSession,
    projectId, projectState, setRun, readSettings, songSearch, suggest
  };
})();
