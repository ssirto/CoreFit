(function () {
  'use strict';

  var KEY = 'corefit-training-v1';
  var builtins = [
    { id: 'upper', name: 'Upper Body Power', focus: 'Petto · Spalle · Tricipiti', duration: 55, icon: '💪', exercises: [
      { name: 'Panca piana', sets: 4, reps: 8, weight: 60 },
      { name: 'Shoulder press', sets: 3, reps: 10, weight: 20 },
      { name: 'Alzate laterali', sets: 3, reps: 12, weight: 8 },
      { name: 'Pushdown tricipiti', sets: 3, reps: 12, weight: 25 }
    ] },
    { id: 'legs', name: 'Leg Day', focus: 'Gambe · Glutei · Core', duration: 60, icon: '⚡', exercises: [
      { name: 'Squat', sets: 4, reps: 8, weight: 70 },
      { name: 'Affondi', sets: 3, reps: 10, weight: 16 },
      { name: 'Leg curl', sets: 3, reps: 12, weight: 35 },
      { name: 'Plank', sets: 3, reps: 45, weight: 0 }
    ] },
    { id: 'pull', name: 'Pull & Back', focus: 'Schiena · Bicipiti', duration: 50, icon: '↗', exercises: [
      { name: 'Lat machine', sets: 4, reps: 10, weight: 45 },
      { name: 'Rematore', sets: 3, reps: 10, weight: 35 },
      { name: 'Curl manubri', sets: 3, reps: 12, weight: 12 }
    ] }
  ];

  function emptyData() { return { routines: [], sessions: [], draft: null }; }
  function readData() {
    try {
      var parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (parsed && Array.isArray(parsed.routines) && Array.isArray(parsed.sessions)) return parsed;
    } catch (error) { /* A fresh demo is safer than an invalid local record. */ }
    return emptyData();
  }
  var data = readData();
  function saveData() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (error) { showNotice('Il browser non consente il salvataggio locale. Controlla le impostazioni di Chrome.'); return false; }
  }
  function element(id) { return document.getElementById(id); }
  function showNotice(message) {
    var box = element('app-notice');
    if (box) { box.textContent = message; box.hidden = false; }
  }
  function allRoutines() { return builtins.concat(data.routines); }
  function findRoutine(id) {
    var routines = allRoutines();
    for (var index = 0; index < routines.length; index++) if (routines[index].id === id) return routines[index];
    return null;
  }
  function newId() { return 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8); }
  function number(value, minimum, maximum) {
    if (value === '' || value === null || value === undefined) return null;
    var parsed = Number(value);
    return isFinite(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
  }
  function node(tag, className, text) {
    var item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function setText(id, value) { if (element(id)) element(id).textContent = String(value); }
  function dateLabel(value) { return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)); }
  function currentWeek(sessions) {
    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    return sessions.filter(function (session) { return new Date(session.completedAt) >= start; });
  }

  function routineCard(routine) {
    var link = node('a', 'card routine-card routine-link');
    link.href = 'session.html?id=' + encodeURIComponent(routine.id);
    var row = node('div', 'row');
    row.appendChild(node('span', 'routine-icon', routine.icon || '✦'));
    var info = node('div');
    info.appendChild(node('h3', '', routine.name));
    info.appendChild(node('p', '', routine.focus));
    row.appendChild(info);
    row.appendChild(node('span', 'chevron', '›'));
    link.appendChild(row);
    var meta = node('div', 'meta');
    meta.appendChild(node('span', '', '◷ ' + routine.duration + ' min'));
    meta.appendChild(node('span', '', '▤ ' + routine.exercises.length + ' esercizi'));
    link.appendChild(meta);
    return link;
  }

  function setupRoutines() {
    var list = element('routine-list');
    if (!list) return;
    list.textContent = '';
    allRoutines().forEach(function (routine) {
      list.appendChild(routineCard(routine));
      if (data.routines.indexOf(routine) !== -1) {
        var edit = node('a', 'small-btn routine-edit-link', 'Modifica ' + routine.name);
        edit.href = 'create-routine.html?id=' + encodeURIComponent(routine.id);
        list.appendChild(edit);
      }
    });
    setText('routine-count', allRoutines().length + ' routine');
    if (data.draft && findRoutine(data.draft.routineId)) {
      var resume = element('resume-routine');
      resume.href = 'session.html?id=' + encodeURIComponent(data.draft.routineId);
      resume.hidden = false;
    }
  }

  var catalog = window.CoreFitExercises;

  function customExercises() { return data.customExercises || []; }
  function favorites() { return data.favoriteExercises || []; }
  function exerciseEntry(item) { return catalog.find(item.exerciseId, item.exercise || item.name, customExercises()); }
  function recentExercises() {
    var used = new Set();
    data.sessions.slice().reverse().forEach(function (session) {
      session.sets.slice().reverse().forEach(function (set) {
        var entry = exerciseEntry(set);
        if (entry) used.add(entry.id);
      });
    });
    return Array.from(used).slice(0, 20);
  }

  function mountPicker(host, add, saveCustomImmediately) {
    window.CoreFitExerciseSelector.mount(host, {
      add: add,
      custom: customExercises,
      favorites: favorites,
      recent: recentExercises,
      toggleFavorite: function (id) {
        var previous = favorites();
        data.favoriteExercises = previous.indexOf(id) === -1 ? previous.concat(id) : previous.filter(function (saved) { return saved !== id; });
        if (saveData()) return true;
        data.favoriteExercises = previous;
        return false;
      },
      create: function (entry) {
        var previous = customExercises();
        entry.id = 'exercise-' + newId();
        data.customExercises = previous.concat(entry);
        if ((!saveCustomImmediately || saveData()) && add(entry)) return true;
        data.customExercises = previous;
        return false;
      }
    });
  }

  function newExercise(entry) {
    var exercise = { exerciseId: entry.id, name: entry.name, trackingType: entry.trackingType, sets: 3, rest: 60, weight: 0 };
    var mode = catalog.mode(exercise);
    exercise[mode.field] = mode.initial;
    return exercise;
  }

  function numberInput(value, min, max, step) {
    var input = node('input');
    input.type = 'number'; input.min = min; input.max = max; input.step = step || 1;
    input.value = value;
    input.required = true;
    return input;
  }

  function field(parent, label, input) {
    var wrap = node('label', 'field');
    wrap.appendChild(node('span', '', label));
    wrap.appendChild(input);
    parent.appendChild(wrap);
    return input;
  }

  function valueLimit(mode) { return mode.field === 'reps' ? 100 : 10000; }
  function integer(value, minimum, maximum) {
    var parsed = number(value, minimum, maximum);
    return Number.isInteger(parsed) ? parsed : null;
  }

  function setupCreator() {
    var form = element('routine-form');
    if (!form || !catalog || !window.CoreFitExerciseSelector) return;
    var editId = new URLSearchParams(window.location.search).get('id');
    var existing = data.routines.find(function (routine) { return routine.id === editId; });
    if (editId && !existing) {
      showNotice('Routine personale non trovata.');
      form.hidden = true;
      return;
    }
    var list = element('exercise-list');
    var rows = [];
    var save = element('save-routine');
    element('creator-fallback').hidden = true;
    element('creator-empty').hidden = !!(existing && existing.exercises.length);
    if (existing) {
      document.title = 'CoreFit · Modifica routine';
      setText('creator-title', 'Modifica routine');
      save.textContent = 'Salva modifiche';
      element('routine-name').value = existing.name;
      element('routine-focus').value = existing.focus;
      element('routine-duration').value = existing.duration;
      existing.exercises.forEach(appendExercise);
    }

    function appendExercise(exercise) {
      var mode = catalog.mode(exercise);
      var card = node('div', 'card exercise-fields');
      var header = node('div', 'row space');
      header.appendChild(node('h3', '', exercise.name));
      var remove = node('button', 'small-btn', 'Rimuovi');
      remove.type = 'button';
      remove.setAttribute('aria-label', 'Rimuovi ' + exercise.name);
      header.appendChild(remove);
      card.appendChild(header);
      var grid = node('div', 'grid-2');
      var sets = field(grid, 'Serie', numberInput(exercise.sets, 1, 10));
      var metric = field(grid, mode.label, numberInput(exercise[mode.field], 1, valueLimit(mode)));
      card.appendChild(grid);
      var weight = mode.weight ? field(card, mode.weight, numberInput(exercise.weight || 0, 0, 1000, 0.5)) : null;
      var rest = field(card, 'Recupero (s)', numberInput(exercise.rest == null ? 60 : exercise.rest, 0, 3600));
      var row = { exercise: exercise, sets: sets, metric: metric, weight: weight, rest: rest };
      rows.push(row);
      list.appendChild(card);
      element('creator-empty').hidden = true;
      save.disabled = false;
      remove.addEventListener('click', function () {
        rows.splice(rows.indexOf(row), 1);
        card.remove();
        element('creator-empty').hidden = rows.length > 0;
        save.disabled = !rows.length;
      });
    }

    mountPicker(element('exercise-picker'), function (entry) {
      appendExercise(newExercise(entry));
      return true;
    }, true);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!rows.length) { showNotice('Aggiungi almeno un esercizio.'); return; }
      var exercises = [];
      for (var index = 0; index < rows.length; index++) {
        var row = rows[index];
        var mode = catalog.mode(row.exercise);
        var entry = exerciseEntry(row.exercise);
        var item = Object.assign({}, row.exercise, {
          sets: integer(row.sets.value, 1, 10),
          weight: row.weight ? number(row.weight.value, 0, 1000) : 0,
          rest: integer(row.rest.value, 0, 3600)
        });
        if (entry) item.exerciseId = entry.id;
        item[mode.field] = integer(row.metric.value, 1, valueLimit(mode));
        if (item.sets === null || item.weight === null || item.rest === null || item[mode.field] === null) {
          showNotice('Controlla i dati degli esercizi.');
          return;
        }
        exercises.push(item);
      }
      var routine = {
        id: existing ? existing.id : newId(),
        name: element('routine-name').value.trim(), focus: element('routine-focus').value.trim(),
        duration: integer(element('routine-duration').value, 5, 240), icon: existing ? existing.icon : '✦', exercises: exercises
      };
      if (!routine.name || !routine.focus || routine.duration === null) { showNotice('Completa nome, obiettivo e durata.'); return; }
      var previous = data.routines;
      var hadLegacyDraft = existing && data.draft && data.draft.routineId === existing.id && !data.draft.routine;
      if (hadLegacyDraft) data.draft.routine = existing;
      data.routines = existing ? previous.map(function (item) { return item.id === existing.id ? routine : item; }) : previous.concat(routine);
      if (saveData()) window.location.href = existing ? 'routines.html' : 'session.html?id=' + encodeURIComponent(routine.id);
      else {
        data.routines = previous;
        if (hadLegacyDraft) delete data.draft.routine;
      }
    });
  }

  function setupSession() {
    var host = element('session-exercises');
    if (!host) return;
    var id = new URLSearchParams(window.location.search).get('id') || 'upper';
    var routine = findRoutine(id);
    if (!routine) { showNotice('Routine non trovata. Torna all’elenco e scegline una.'); return; }
    var oldDraft = data.draft;
    if (!catalog || !window.CoreFitExerciseSelector) return;
    if (oldDraft && oldDraft.routineId !== id) {
      if (!window.confirm('Hai un altro allenamento in corso. Vuoi iniziare questa routine e sostituirlo?')) {
        window.location.href = 'session.html?id=' + encodeURIComponent(oldDraft.routineId);
        return;
      }
      data.draft = null;
    }
    if (!data.draft) data.draft = { routineId: id, startedAt: Date.now(), values: {} };
    var draft = data.draft;
    // Snapshot the exercise order so editing a saved routine cannot shift an active draft's sets.
    if (!draft.routine) draft.routine = Object.assign({}, routine, { exercises: routine.exercises.map(function (exercise) { return Object.assign({}, exercise); }) });
    if (!saveData()) {
      data.draft = oldDraft;
      return;
    }
    routine = draft.routine;
    element('session-fallback').hidden = true;
    setText('session-title', routine.name);
    setText('session-focus', routine.focus);
    setText('session-duration', routine.duration + ' minuti previsti');
    var workout = [];

    function appendWorkoutExercise(exercise, exerciseIndex) {
      var mode = catalog.mode(exercise);
      var card = node('div', 'card workout-exercise');
      var heading = node('div', 'row space');
      heading.appendChild(node('h3', '', exercise.name));
      var count = node('span', 'pill');
      heading.appendChild(count);
      card.appendChild(heading);
      var rows = [];
      workout.push(rows);

      var settings = node('details', 'exercise-picker-filters');
      settings.appendChild(node('summary', '', 'Serie e recupero'));
      var setCount = field(settings, 'Serie', numberInput(exercise.sets, 1, 10));
      var rest = field(settings, 'Recupero (s)', numberInput(exercise.rest == null ? 60 : exercise.rest, 0, 3600));
      card.appendChild(settings);

      var labels = node('div', 'workout-set exercise-log-row');
      if (!mode.weight) labels.classList.add('without-weight');
      labels.appendChild(node('span', '', 'Serie'));
      if (mode.weight) labels.appendChild(node('span', '', mode.weight));
      labels.appendChild(node('span', '', mode.short));
      labels.appendChild(node('span', '', '✓'));
      card.appendChild(labels);

      function renderSet(setIndex) {
        var key = exerciseIndex + '-' + setIndex;
        var saved = draft.values[key] || exercise;
        var row = node('div', 'workout-set exercise-log-row');
        if (!mode.weight) row.classList.add('without-weight');
        row.appendChild(node('span', '', String(setIndex + 1)));
        var prefix = exercise.name + ', serie ' + (setIndex + 1) + ', ';
        var weight = mode.weight ? numberInput(saved.weight, 0, 1000, 0.5) : null;
        if (weight) {
          weight.setAttribute('aria-label', prefix + mode.weight);
          row.appendChild(weight);
        }
        var metric = numberInput(saved[mode.field], 1, valueLimit(mode));
        metric.setAttribute('aria-label', prefix + mode.label);
        row.appendChild(metric);
        var done = node('input');
        done.type = 'checkbox';
        done.checked = !!saved.done;
        done.setAttribute('aria-label', prefix + 'completata');
        row.appendChild(done);
        card.appendChild(row);

        function rawValues() {
          var values = { done: done.checked, weight: weight ? weight.value : 0 };
          values[mode.field] = metric.value;
          return values;
        }
        function persist() {
          draft.values[key] = rawValues();
          saveData();
          updateProgress();
        }
        if (weight) weight.addEventListener('input', persist);
        metric.addEventListener('input', persist);
        done.addEventListener('change', persist);
        rows.push({ element: row, values: rawValues, done: done });
      }

      for (var index = 0; index < exercise.sets; index++) renderSet(index);
      count.textContent = rows.length + ' serie';
      setCount.addEventListener('change', function () {
        var next = integer(setCount.value, 1, 10);
        if (next === null || rows.slice(next).some(function (row) { return row.done.checked; })) {
          setCount.value = rows.length;
          showNotice('Scegli da 1 a 10 serie. Deseleziona le serie completate prima di rimuoverle.');
          return;
        }
        var previous = exercise.sets;
        exercise.sets = next;
        if (!saveData()) {
          exercise.sets = previous;
          setCount.value = previous;
          return;
        }
        while (rows.length > next) rows.pop().element.remove();
        while (rows.length < next) renderSet(rows.length);
        count.textContent = rows.length + ' serie';
        updateProgress();
      });
      rest.addEventListener('change', function () {
        var next = integer(rest.value, 0, 3600);
        var previous = exercise.rest;
        if (next === null) {
          rest.value = previous == null ? 60 : previous;
          showNotice('Inserisci un recupero tra 0 e 3600 secondi.');
          return;
        }
        exercise.rest = next;
        if (!saveData()) {
          exercise.rest = previous;
          rest.value = previous == null ? 60 : previous;
        }
      });
      host.appendChild(card);
    }

    routine.exercises.forEach(appendWorkoutExercise);

    function completedSets() {
      var result = [];
      for (var exerciseIndex = 0; exerciseIndex < workout.length; exerciseIndex++) {
        var exercise = routine.exercises[exerciseIndex];
        var entry = exerciseEntry(exercise);
        var mode = catalog.mode(exercise);
        var rows = workout[exerciseIndex];
        for (var setIndex = 0; setIndex < rows.length; setIndex++) {
          var values = rows[setIndex].values();
          if (!values.done) continue;
          var weight = number(values.weight, 0, 1000);
          var metric = integer(values[mode.field], 1, valueLimit(mode));
          if (weight === null || metric === null) return null;
          var set = {
            exercise: exercise.name, set: setIndex + 1, weight: weight,
            trackingType: exercise.trackingType || 'weight_reps', rest: exercise.rest == null ? 60 : exercise.rest
          };
          if (entry) set.exerciseId = entry.id;
          set[mode.field] = metric;
          result.push(set);
        }
      }
      return result;
    }

    var finish = element('finish-session');
    function updateProgress() {
      var sets = completedSets();
      var count = sets ? sets.length : 0;
      var total = workout.reduce(function (sum, rows) { return sum + rows.length; }, 0);
      setText('completed-count', count + ' / ' + total);
      element('session-progress').style.width = (total ? Math.round(count / total * 100) : 0) + '%';
      finish.disabled = sets ? count === 0 : false;
    }

    mountPicker(element('exercise-picker'), function (entry) {
      var exercise = newExercise(entry);
      routine.exercises.push(exercise);
      if (!saveData()) {
        routine.exercises.pop();
        return false;
      }
      appendWorkoutExercise(exercise, routine.exercises.length - 1);
      updateProgress();
      return true;
    });

    updateProgress();
    finish.addEventListener('click', function () {
      var sets = completedSets();
      if (sets === null) { showNotice('Controlla i valori delle serie completate.'); return; }
      if (!sets.length) { showNotice('Completa almeno una serie prima di terminare.'); return; }
      var minutes = Math.max(1, Math.round((Date.now() - draft.startedAt) / 60000));
      var session = { id: newId(), routineId: id, routineName: routine.name, completedAt: new Date().toISOString(), minutes: minutes, sets: sets, xp: 20 + sets.length * 10 };
      data.sessions.push(session);
      data.draft = null;
      if (saveData()) window.location.href = 'stats.html?done=1';
      else { data.sessions.pop(); data.draft = draft; }
    });
  }

  function setDescription(item) {
    var mode = catalog ? catalog.mode(item) : { weight: true, field: 'reps' };
    var value = item[mode.field];
    if (mode.field === 'seconds') return (mode.weight ? item.weight + ' kg · ' : '') + value + ' s';
    if (mode.field === 'meters') return (mode.weight ? item.weight + ' kg · ' : '') + value + ' m';
    if (item.trackingType === 'assisted_reps') return item.weight + ' kg assistenza × ' + value;
    return mode.weight ? item.weight + ' kg × ' + value : value + ' rip.';
  }

  function setupStats() {
    if (!element('stats-sessions')) return;
    var allMinutes = data.sessions.reduce(function (sum, session) { return sum + session.minutes; }, 0);
    setText('stats-total-count', data.sessions.length);
    setText('stats-total-minutes', allMinutes);
    var volume = 0;
    data.sessions.forEach(function (session) {
      session.sets.forEach(function (item) {
        if (!item.trackingType || item.trackingType === 'weight_reps' || item.trackingType === 'weighted_bodyweight') volume += item.weight * item.reps;
      });
    });
    setText('stats-total-volume', new Intl.NumberFormat('it-IT').format(volume) + ' kg');
    var today = new Date();
    var month = new Date(today.getFullYear(), today.getMonth(), 1);
    var calendar = element('stats-calendar');
    function renderMonth() {
      var year = month.getFullYear();
      var monthIndex = month.getMonth();
      var dayCount = new Date(year, monthIndex + 1, 0).getDate();
      var counts = [];
      for (var day = 0; day <= dayCount; day++) counts.push(0);
      var monthSessions = data.sessions.filter(function (session) {
        var date = new Date(session.completedAt);
        if (isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== monthIndex) return false;
        counts[date.getDate()]++;
        return true;
      });
      var monthName = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(month);
      setText('stats-month-label', monthName.charAt(0).toUpperCase() + monthName.slice(1));
      setText('stats-month-count', monthSessions.length);
      setText('stats-month-minutes', monthSessions.reduce(function (sum, session) { return sum + session.minutes; }, 0));
      element('stats-next-month').disabled = year === today.getFullYear() && monthIndex === today.getMonth();
      calendar.textContent = '';
      calendar.setAttribute('aria-label', 'Allenamenti di ' + monthName);
      for (var dateNumber = 1; dateNumber <= dayCount; dateNumber++) {
        var square = node('span', 'activity-day' + (counts[dateNumber] ? ' active' : ''));
        var label = dateNumber + ' ' + monthName + ': ' + counts[dateNumber] + (counts[dateNumber] === 1 ? ' allenamento' : ' allenamenti');
        square.setAttribute('role', 'gridcell');
        square.setAttribute('aria-label', label);
        square.title = label;
        calendar.appendChild(square);
      }
    }
    element('stats-prev-month').addEventListener('click', function () { month = new Date(month.getFullYear(), month.getMonth() - 1, 1); renderMonth(); });
    element('stats-next-month').addEventListener('click', function () {
      if (month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth()) return;
      month = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      renderMonth();
    });
    renderMonth();
    if (window.location.search.indexOf('done=1') !== -1 && data.sessions.length) showNotice('Allenamento salvato. Ottimo lavoro!');
    var list = element('stats-sessions');
    list.textContent = '';
    if (!data.sessions.length) { list.appendChild(node('p', 'empty', 'Completa un allenamento per vedere qui i tuoi risultati.')); return; }
    data.sessions.slice().reverse().forEach(function (session) {
      var row = node('div', 'list-row');
      row.appendChild(node('span', 'circle-icon', '✓'));
      var info = node('div');
      info.appendChild(node('strong', '', session.routineName));
      info.appendChild(node('small', '', dateLabel(session.completedAt) + ' · ' + session.minutes + ' min · ' + session.sets.length + ' serie'));
      row.appendChild(info);
      row.appendChild(node('span', 'pill', '+' + session.xp + ' XP'));
      list.appendChild(row);
      var details = node('details', 'session-details');
      details.appendChild(node('summary', '', 'Vedi le serie registrate'));
      session.sets.forEach(function (item) {
        details.appendChild(node('div', 'session-set-detail', item.exercise + ' · serie ' + item.set + ' · ' + setDescription(item)));
      });
      list.appendChild(details);
    });
  }

  function setupHome() {
    if (!element('home-week-count')) return;
    var week = currentWeek(data.sessions);
    setText('home-week-count', week.length);
    setText('home-week-minutes', week.reduce(function (sum, session) { return sum + session.minutes; }, 0));
    if (data.draft && findRoutine(data.draft.routineId)) {
      var resume = element('home-resume');
      resume.href = 'session.html?id=' + encodeURIComponent(data.draft.routineId);
      resume.hidden = false;
    }
  }

  function setupProfile() {
    setText('profile-sessions', data.sessions.length);
    setText('profile-sets', data.sessions.reduce(function (sum, session) { return sum + session.sets.length; }, 0));
  }

  function start() {
    var page = document.body.getAttribute('data-page');
    if (page === 'routines') setupRoutines();
    if (page === 'create') setupCreator();
    if (page === 'session') setupSession();
    if (page === 'stats') setupStats();
    if (page === 'home') setupHome();
    if (page === 'profile') setupProfile();
    document.documentElement.setAttribute('data-corefit-ready', 'true');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}());
