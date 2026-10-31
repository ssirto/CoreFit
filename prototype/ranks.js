(function () {
  'use strict';

  var STORAGE_KEY = 'corefit-training-v1';
  var TIERS = ['WOOD', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'CHAMPION', 'TITAN', 'OLYMPIAN'];
  var DIVISIONS = ['III', 'II', 'I'];
  var LAST_INDEX = TIERS.length * DIVISIONS.length - 1;

  function element(id) { return document.getElementById(id); }
  function node(tag, className, value) {
    var item = document.createElement(tag);
    if (className) item.className = className;
    if (value !== undefined) item.textContent = value;
    return item;
  }
  function readSessions() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return data && Array.isArray(data.sessions) ? data.sessions : [];
    } catch (error) { return []; }
  }
  function threshold(index) { return 80 * index + 12 * index * index; }
  function indexFor(score) {
    var index = 0;
    while (index < LAST_INDEX && score >= threshold(index + 1)) index++;
    return index;
  }
  function rank(index) {
    var tierIndex = Math.floor(index / 3);
    return { name: TIERS[tierIndex] + ' ' + DIVISIONS[index % 3], className: 'rank-' + TIERS[tierIndex].toLowerCase() };
  }
  function calculate() {
    var byName = {};
    readSessions().filter(function (session) { return session && !isNaN(new Date(session.completedAt).getTime()); }).sort(function (a, b) { return new Date(a.completedAt) - new Date(b.completedAt); }).forEach(function (session) {
      if (!session || !Array.isArray(session.sets)) return;
      session.sets.forEach(function (set) {
        if (!set || typeof set.exercise !== 'string') return;
        var name = set.exercise.trim().replace(/\s+/g, ' ');
        var key = name.toLowerCase();
        var reps = Number(set.reps);
        var weight = Number(set.weight);
        if (!name || !isFinite(reps) || !isFinite(weight) || reps <= 0 || weight < 0) return;
        if (!byName[key]) byName[key] = { name: name, score: 0, sets: 0, best: 0, bestSet: null };
        var exercise = byName[key];
        var performance = weight > 0 ? weight * (1 + reps / 30) : reps;
        var personalBest = performance > exercise.best;
        exercise.score += Math.round(10 + Math.min(reps, 30) + Math.min(weight, 300) / 10 + (personalBest ? 15 : 0));
        exercise.sets++;
        if (personalBest) {
          exercise.best = performance;
          exercise.bestSet = { weight: weight, reps: reps };
        }
      });
    });
    var exercises = Object.keys(byName).map(function (key) {
      var item = byName[key];
      item.index = indexFor(item.score);
      return item;
    });
    exercises.sort(function (a, b) { return b.index - a.index || b.score - a.score || a.name.localeCompare(b.name, 'it'); });
    var average = exercises.length ? Math.round(exercises.reduce(function (sum, exercise) { return sum + exercise.index; }, 0) / exercises.length) : null;
    return { exercises: exercises, generalIndex: average };
  }
  function setRank(id, index) {
    var target = element(id);
    if (!target) return;
    target.textContent = index === null ? 'Non classificato' : rank(index).name;
    target.className = 'rank-name ' + (index === null ? 'rank-unranked' : rank(index).className);
  }
  function renderSummary(result) {
    setRank('home-general-rank', result.generalIndex);
    setRank('profile-general-rank', result.generalIndex);
    if (element('home-rank-count')) element('home-rank-count').textContent = result.exercises.length + (result.exercises.length === 1 ? ' esercizio classificato' : ' esercizi classificati');
    if (element('profile-rank-count')) element('profile-rank-count').textContent = result.exercises.length + (result.exercises.length === 1 ? ' esercizio' : ' esercizi') + ' nella media';
  }
  function renderRanks(result) {
    var host = element('rank-list');
    if (!host) return;
    setRank('rank-general', result.generalIndex);
    if (element('rank-general-count')) element('rank-general-count').textContent = result.exercises.length + (result.exercises.length === 1 ? ' esercizio nella media' : ' esercizi nella media');
    host.textContent = '';
    if (!result.exercises.length) {
      var empty = node('div', 'card rank-empty');
      empty.appendChild(node('strong', '', 'Ancora nessun esercizio classificato'));
      empty.appendChild(node('p', 'sub', 'Completa almeno una serie e salva l’allenamento: il primo rank comparirà qui.'));
      host.appendChild(empty);
      return;
    }
    result.exercises.forEach(function (exercise) {
      var info = rank(exercise.index);
      var card = node('div', 'card exercise-rank-card');
      var header = node('div', 'row space rank-card-header');
      header.appendChild(node('strong', '', exercise.name));
      header.appendChild(node('span', 'rank-chip ' + info.className, info.name));
      card.appendChild(header);
      var details = node('div', 'rank-card-details');
      details.appendChild(node('span', '', exercise.sets + (exercise.sets === 1 ? ' serie completata' : ' serie completate')));
      if (exercise.bestSet) details.appendChild(node('span', '', exercise.bestSet.weight > 0 ? 'Record: ' + exercise.bestSet.weight + ' kg × ' + exercise.bestSet.reps + ' rip.' : 'Record: ' + exercise.bestSet.reps + ' rip. a corpo libero'));
      card.appendChild(details);
      var current = threshold(exercise.index);
      var next = exercise.index < LAST_INDEX ? threshold(exercise.index + 1) : null;
      var track = node('div', 'progress-track rank-progress');
      var fill = node('div', 'progress-fill');
      fill.style.width = next === null ? '100%' : Math.min(100, Math.round((exercise.score - current) / (next - current) * 100)) + '%';
      track.appendChild(fill);
      card.appendChild(track);
      card.appendChild(node('small', 'rank-progress-label', next === null ? 'Rank massimo raggiunto' : exercise.score + ' / ' + next + ' punti per ' + rank(exercise.index + 1).name));
      host.appendChild(card);
    });
  }
  function start() {
    var result = calculate();
    renderSummary(result);
    renderRanks(result);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}());
