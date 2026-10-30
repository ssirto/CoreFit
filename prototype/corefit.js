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
    allRoutines().forEach(function (routine) { list.appendChild(routineCard(routine)); });
    setText('routine-count', allRoutines().length + ' routine');
    if (data.draft && findRoutine(data.draft.routineId)) {
      var resume = element('resume-routine');
      resume.href = 'session.html?id=' + encodeURIComponent(data.draft.routineId);
      resume.hidden = false;
    }
  }

  function exerciseRow() {
    var card = node('div', 'card exercise-fields');
    card.innerHTML = '<div class="row space"><strong>Esercizio</strong><button type="button" class="small-btn remove-exercise">Rimuovi</button></div>' +
      '<label class="field"><span>Nome esercizio</span><input class="exercise-name" maxlength="60" placeholder="Es. Squat" required></label>' +
      '<div class="grid-2"><label class="field"><span>Serie</span><input class="exercise-sets" type="number" min="1" max="10" value="3" required></label>' +
      '<label class="field"><span>Ripetizioni</span><input class="exercise-reps" type="number" min="1" max="100" value="10" required></label></div>' +
      '<label class="field"><span>Peso iniziale (kg)</span><input class="exercise-weight" type="number" min="0" max="1000" step="0.5" value="0" required></label>';
    card.querySelector('.remove-exercise').addEventListener('click', function () {
      if (element('exercise-list').children.length > 1) card.remove();
    });
    return card;
  }
  function setupCreator() {
    var form = element('routine-form');
    if (!form) return;
    element('creator-fallback').hidden = true;
    element('exercise-list').appendChild(exerciseRow());
    element('add-exercise').addEventListener('click', function () { element('exercise-list').appendChild(exerciseRow()); });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var cards = element('exercise-list').querySelectorAll('.exercise-fields');
      var exercises = [];
      for (var index = 0; index < cards.length; index++) {
        var card = cards[index];
        var item = {
          name: card.querySelector('.exercise-name').value.trim(),
          sets: number(card.querySelector('.exercise-sets').value, 1, 10),
          reps: number(card.querySelector('.exercise-reps').value, 1, 100),
          weight: number(card.querySelector('.exercise-weight').value, 0, 1000)
        };
        if (!item.name || item.sets === null || item.reps === null || item.weight === null) { showNotice('Controlla i dati degli esercizi.'); return; }
        exercises.push(item);
      }
      var routine = {
        id: newId(), name: element('routine-name').value.trim(), focus: element('routine-focus').value.trim(),
        duration: number(element('routine-duration').value, 5, 240), icon: '✦', exercises: exercises
      };
      if (!routine.name || !routine.focus || routine.duration === null) { showNotice('Completa nome, obiettivo e durata.'); return; }
      data.routines.push(routine);
      if (saveData()) window.location.href = 'session.html?id=' + encodeURIComponent(routine.id);
      else data.routines.pop();
    });
  }

  function setupSession() {
    var host = element('session-exercises');
    if (!host) return;
    var id = new URLSearchParams(window.location.search).get('id') || 'upper';
    var routine = findRoutine(id);
    if (!routine) { showNotice('Routine non trovata. Torna all’elenco e scegline una.'); return; }
    if (element('session-fallback')) element('session-fallback').hidden = true;
    if (data.draft && data.draft.routineId !== id) {
      if (!window.confirm('Hai un altro allenamento in corso. Vuoi iniziare questa routine e sostituirlo?')) {
        window.location.href = 'session.html?id=' + encodeURIComponent(data.draft.routineId);
        return;
      }
      data.draft = null;
    }
    if (!data.draft) data.draft = { routineId: id, startedAt: Date.now(), values: {} };
    saveData();
    setText('session-title', routine.name);
    setText('session-focus', routine.focus);
    setText('session-duration', routine.duration + ' minuti previsti');
    var total = 0;
    routine.exercises.forEach(function (exercise, exerciseIndex) {
      var card = node('div', 'card workout-exercise');
      var heading = node('div', 'row space');
      heading.appendChild(node('h3', '', exercise.name));
      heading.appendChild(node('span', 'pill', exercise.sets + ' serie'));
      card.appendChild(heading);
      card.appendChild(node('p', 'mini-label', exercise.reps + ' ripetizioni previste'));
      var labels = node('div', 'workout-set');
      ['','kg','rip.','✓'].forEach(function (value) { labels.appendChild(node('span', '', value)); });
      card.appendChild(labels);
      for (var setIndex = 0; setIndex < exercise.sets; setIndex++) {
        total++;
        var key = exerciseIndex + '-' + setIndex;
        var saved = data.draft.values[key] || { weight: exercise.weight, reps: exercise.reps, done: false };
        var row = node('div', 'workout-set');
        row.appendChild(node('span', '', setIndex + 1));
        var weight = node('input');
        weight.type = 'number'; weight.min = '0'; weight.max = '1000'; weight.step = '0.5'; weight.value = saved.weight;
        weight.setAttribute('aria-label', exercise.name + ', serie ' + (setIndex + 1) + ', peso');
        var reps = node('input');
        reps.type = 'number'; reps.min = '1'; reps.max = '100'; reps.value = saved.reps;
        reps.setAttribute('aria-label', exercise.name + ', serie ' + (setIndex + 1) + ', ripetizioni');
        var done = node('input');
        done.type = 'checkbox'; done.checked = !!saved.done;
        done.setAttribute('aria-label', exercise.name + ', serie ' + (setIndex + 1) + ' completata');
        (function (setKey, weightInput, repsInput, doneInput) {
          function persist() {
            data.draft.values[setKey] = { weight: weightInput.value, reps: repsInput.value, done: doneInput.checked };
            saveData(); updateProgress();
          }
          weightInput.addEventListener('change', persist);
          repsInput.addEventListener('change', persist);
          doneInput.addEventListener('change', persist);
        }(key, weight, reps, done));
        row.appendChild(weight); row.appendChild(reps); row.appendChild(done); card.appendChild(row);
      }
      host.appendChild(card);
    });
    function completedSets() {
      var result = [];
      var cards = host.querySelectorAll('.workout-exercise');
      for (var exerciseIndex = 0; exerciseIndex < cards.length; exerciseIndex++) {
        var rows = cards[exerciseIndex].querySelectorAll('.workout-set');
        for (var setIndex = 1; setIndex < rows.length; setIndex++) {
          var inputs = rows[setIndex].querySelectorAll('input');
          if (!inputs[2].checked) continue;
          var weight = number(inputs[0].value, 0, 1000);
          var reps = number(inputs[1].value, 1, 100);
          if (weight === null || reps === null) return null;
          result.push({ exercise: routine.exercises[exerciseIndex].name, set: setIndex, weight: weight, reps: reps });
        }
      }
      return result;
    }
    function updateProgress() {
      var sets = completedSets();
      var count = sets ? sets.length : 0;
      setText('completed-count', count + ' / ' + total);
      element('session-progress').style.width = Math.round(count / total * 100) + '%';
      element('finish-session').disabled = count === 0;
    }
    updateProgress();
    element('finish-session').addEventListener('click', function () {
      var sets = completedSets();
      if (sets === null) { showNotice('Controlla peso e ripetizioni delle serie completate.'); return; }
      if (!sets.length) { showNotice('Completa almeno una serie prima di terminare.'); return; }
      var minutes = Math.max(1, Math.round((Date.now() - data.draft.startedAt) / 60000));
      var session = { id: newId(), routineId: id, routineName: routine.name, completedAt: new Date().toISOString(), minutes: minutes, sets: sets, xp: 20 + sets.length * 10 };
      data.sessions.push(session);
      data.draft = null;
      if (saveData()) window.location.href = 'stats.html?done=1';
      else { data.sessions.pop(); data.draft = { routineId: id, startedAt: Date.now(), values: {} }; }
    });
  }

  function setupStats() {
    if (!element('stats-sessions')) return;
    var week = currentWeek(data.sessions);
    var weekMinutes = week.reduce(function (sum, session) { return sum + session.minutes; }, 0);
    var allMinutes = data.sessions.reduce(function (sum, session) { return sum + session.minutes; }, 0);
    setText('stats-week-count', week.length);
    setText('stats-week-minutes', weekMinutes);
    setText('stats-total-count', data.sessions.length);
    setText('stats-total-minutes', allMinutes);
    var volume = 0;
    data.sessions.forEach(function (session) { session.sets.forEach(function (item) { volume += item.weight * item.reps; }); });
    setText('stats-total-volume', new Intl.NumberFormat('it-IT').format(volume) + ' kg');
    var counts = [0, 0, 0, 0, 0, 0, 0];
    week.forEach(function (session) { counts[(new Date(session.completedAt).getDay() + 6) % 7]++; });
    var maximum = Math.max.apply(null, [1].concat(counts));
    var chart = element('stats-chart');
    ['L', 'M', 'M', 'G', 'V', 'S', 'D'].forEach(function (label, index) {
      var column = node('div', 'chart-col');
      var bar = node('div', 'chart-bar' + (counts[index] ? ' current' : ''));
      bar.style.height = Math.max(4, counts[index] / maximum * 85) + '%';
      column.appendChild(bar);
      column.appendChild(node('small', '', label));
      chart.appendChild(column);
    });
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
        details.appendChild(node('div', 'session-set-detail', item.exercise + ' · serie ' + item.set + ' · ' + item.weight + ' kg × ' + item.reps));
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
