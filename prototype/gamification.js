(function () {
  'use strict';

  var TRAINING_KEY = 'corefit-training-v1';
  var READ_KEY = 'corefit-notifications-read-v1';
  var XP_PER_LEVEL = 200;
  var achievements = [
    { id: 'first', icon: '✦', title: 'Primo passo', description: 'Completa il primo allenamento', target: 1, xp: 50, value: function (progress) { return progress.sessions; } },
    { id: 'five', icon: '★', title: 'In ritmo', description: 'Completa 5 allenamenti', target: 5, xp: 100, value: function (progress) { return progress.sessions; } },
    { id: 'twenty', icon: '◆', title: 'Costanza', description: 'Completa 20 allenamenti', target: 20, xp: 250, value: function (progress) { return progress.sessions; } },
    { id: 'streak-three', icon: '♨', title: 'Tre giorni di fila', description: 'Allenati per 3 giorni consecutivi', target: 3, xp: 75, value: function (progress) { return progress.bestStreak; } },
    { id: 'streak-seven', icon: '♨', title: 'Sette giorni di fila', description: 'Allenati per 7 giorni consecutivi', target: 7, xp: 150, value: function (progress) { return progress.bestStreak; } },
    { id: 'sets-fifty', icon: '▤', title: '50 serie', description: 'Completa 50 serie in totale', target: 50, xp: 125, value: function (progress) { return progress.sets; } }
  ];
  var challenges = [
    { id: 'week-days', icon: '⚡', title: 'Tre giorni attivi', description: 'Allenati in 3 giorni diversi questa settimana', period: 'week', target: 3, xp: 100, value: function (progress, key) { return progress.weekDays[key] || 0; } },
    { id: 'week-sets', icon: '▤', title: '12 serie completate', description: 'Completa 12 serie questa settimana', period: 'week', target: 12, xp: 80, value: function (progress, key) { return progress.weekSets[key] || 0; } },
    { id: 'month-days', icon: '✳', title: 'Mese in movimento', description: 'Allenati in 8 giorni diversi questo mese', period: 'month', target: 8, xp: 200, value: function (progress, key) { return progress.monthDays[key] || 0; } }
  ];

  function element(id) { return document.getElementById(id); }
  function setText(id, value) { if (element(id)) element(id).textContent = String(value); }
  function node(tag, className, text) {
    var item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function readSessions() {
    try {
      var data = JSON.parse(localStorage.getItem(TRAINING_KEY) || 'null');
      return data && Array.isArray(data.sessions) ? data.sessions : [];
    } catch (error) { return []; }
  }
  function readIds() {
    try {
      var ids = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
      return Array.isArray(ids) ? ids : [];
    } catch (error) { return []; }
  }
  function dayNumber(date) { return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000); }
  function dayKey(date) { return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(); }
  function weekKey(date) {
    var monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
    return dayKey(monday);
  }
  function monthKey(date) { return date.getFullYear() + '-' + (date.getMonth() + 1); }
  function levelFor(xp) { return Math.floor(xp / XP_PER_LEVEL) + 1; }
  function dateLabel(value) { return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)); }
  function progressState() {
    return { sessions: 0, sets: 0, streak: 0, bestStreak: 0, lastDay: null, weekDays: {}, weekSets: {}, monthDays: {} };
  }
  function calculate() {
    var sessions = readSessions().filter(function (session) { return session && !isNaN(new Date(session.completedAt).getTime()); });
    sessions.sort(function (a, b) { return new Date(a.completedAt) - new Date(b.completedAt); });
    var progress = progressState();
    var events = [];
    var unlocked = {};
    var completedChallenges = {};
    var totalXP = 0;
    function award(event) {
      var oldLevel = levelFor(totalXP);
      totalXP += event.xp;
      events.push(event);
      for (var level = oldLevel + 1; level <= levelFor(totalXP); level++) {
        events.push({ id: 'level-' + level, title: 'Livello ' + level + ' raggiunto', description: 'Continua a costruire la tua costanza.', icon: '⬆', xp: 0, date: event.date, sessionId: event.sessionId });
      }
    }
    sessions.forEach(function (session, index) {
      var date = new Date(session.completedAt);
      var day = dayNumber(date);
      var week = weekKey(date);
      var month = monthKey(date);
      var distinctDay = progress.lastDay !== day;
      var sets = Array.isArray(session.sets) ? session.sets.length : 0;
      var baseXP = Number(session.xp);
      if (!isFinite(baseXP) || baseXP < 0) baseXP = 20 + sets * 10;
      baseXP = Math.floor(baseXP);
      progress.sessions++;
      progress.sets += sets;
      progress.weekSets[week] = (progress.weekSets[week] || 0) + sets;
      if (distinctDay) {
        progress.streak = progress.lastDay === day - 1 ? progress.streak + 1 : 1;
        progress.bestStreak = Math.max(progress.bestStreak, progress.streak);
        progress.lastDay = day;
        progress.weekDays[week] = (progress.weekDays[week] || 0) + 1;
        progress.monthDays[month] = (progress.monthDays[month] || 0) + 1;
      }
      var sessionId = session.id || 'legacy-' + index;
      award({ id: 'workout-' + sessionId, title: 'Allenamento completato', description: session.routineName || 'Sessione CoreFit', icon: '✓', xp: baseXP, date: session.completedAt, sessionId: sessionId });
      if (distinctDay && progress.streak > 1) {
        award({ id: 'streak-' + dayKey(date), title: 'Streak di ' + progress.streak + ' giorni', description: 'Hai mantenuto la tua serie di allenamenti.', icon: '♨', xp: 10, date: session.completedAt, sessionId: sessionId });
      }
      achievements.forEach(function (achievement) {
        if (unlocked[achievement.id] || achievement.value(progress) < achievement.target) return;
        unlocked[achievement.id] = session.completedAt;
        award({ id: 'achievement-' + achievement.id, title: 'Achievement: ' + achievement.title, description: achievement.description, icon: achievement.icon, xp: achievement.xp, date: session.completedAt, sessionId: sessionId });
      });
      challenges.forEach(function (challenge) {
        var periodKey = challenge.period === 'week' ? week : month;
        var id = challenge.id + '-' + periodKey;
        if (completedChallenges[id] || challenge.value(progress, periodKey) < challenge.target) return;
        completedChallenges[id] = session.completedAt;
        award({ id: 'challenge-' + id, title: 'Sfida completata: ' + challenge.title, description: challenge.description, icon: challenge.icon, xp: challenge.xp, date: session.completedAt, sessionId: sessionId });
      });
    });
    var today = dayNumber(new Date());
    var activeStreak = progress.lastDay !== null && today - progress.lastDay >= 0 && today - progress.lastDay <= 1 ? progress.streak : 0;
    return { progress: progress, events: events, unlocked: unlocked, completedChallenges: completedChallenges, xp: totalXP, level: levelFor(totalXP), activeStreak: activeStreak };
  }
  function bar(value, maximum) {
    var track = node('div', 'progress-track game-progress');
    var fill = node('div', 'progress-fill');
    fill.style.width = Math.min(100, Math.round(value / maximum * 100)) + '%';
    track.appendChild(fill);
    return track;
  }
  function rewardCard(icon, title, description, detail, value, target, done) {
    var card = node('div', 'card reward-card' + (done ? ' reward-done' : ''));
    var top = node('div', 'row');
    top.appendChild(node('span', 'reward-icon', icon));
    var copy = node('div', 'reward-copy');
    copy.appendChild(node('strong', '', title));
    copy.appendChild(node('small', '', description));
    top.appendChild(copy);
    top.appendChild(node('span', 'reward-xp', detail));
    card.appendChild(top);
    card.appendChild(bar(value, target));
    card.appendChild(node('div', 'reward-progress', done ? 'Completato' : Math.min(value, target) + ' / ' + target));
    return card;
  }
  function currentChallenge(challenge, result) {
    var key = challenge.period === 'week' ? weekKey(new Date()) : monthKey(new Date());
    var value = challenge.value(result.progress, key);
    return { value: value, done: value >= challenge.target, period: challenge.period === 'week' ? 'Questa settimana' : 'Questo mese' };
  }
  function renderHome(result, readIds) {
    setText('home-level', result.level);
    setText('home-xp', result.xp);
    setText('home-xp-next', (result.level * XP_PER_LEVEL));
    setText('home-streak', result.activeStreak);
    setText('home-streak-unit', result.activeStreak === 1 ? 'giorno' : 'giorni');
    setText('home-best-streak', result.progress.bestStreak);
    if (element('home-xp-fill')) element('home-xp-fill').style.width = Math.round(result.xp % XP_PER_LEVEL / XP_PER_LEVEL * 100) + '%';
    var unread = result.events.filter(function (event) { return readIds.indexOf(event.id) === -1; }).length;
    var badge = element('home-notification-count');
    if (badge) { badge.textContent = unread > 99 ? '99+' : String(unread); badge.hidden = unread === 0; badge.parentNode.setAttribute('aria-label', 'Apri notifiche: ' + unread + ' da leggere'); }
    var achievementHost = element('home-achievement-preview');
    if (achievementHost) {
      achievementHost.textContent = '';
      var newest = achievements.filter(function (item) { return result.unlocked[item.id]; }).pop();
      achievementHost.appendChild(newest ? rewardCard(newest.icon, newest.title, 'Ultimo achievement sbloccato', '+' + newest.xp + ' XP', newest.target, newest.target, true) : node('p', 'sub', 'Il primo achievement si sblocca completando un allenamento.'));
    }
    var challengeHost = element('home-challenge-preview');
    if (challengeHost) {
      challengeHost.textContent = '';
      var challenge = challenges[0];
      var current = currentChallenge(challenge, result);
      challengeHost.appendChild(rewardCard(challenge.icon, challenge.title, current.period, '+' + challenge.xp + ' XP', current.value, challenge.target, current.done));
    }
  }
  function renderAchievements(result) {
    setText('achievement-earned', Object.keys(result.unlocked).length);
    var host = element('achievement-list');
    if (!host) return;
    host.textContent = '';
    achievements.forEach(function (achievement) {
      var done = !!result.unlocked[achievement.id];
      host.appendChild(rewardCard(achievement.icon, achievement.title, achievement.description, '+' + achievement.xp + ' XP', achievement.value(result.progress), achievement.target, done));
    });
  }
  function renderChallenges(result) {
    var host = element('challenge-list');
    if (!host) return;
    host.textContent = '';
    challenges.forEach(function (challenge) {
      var current = currentChallenge(challenge, result);
      var card = rewardCard(challenge.icon, challenge.title, challenge.description, '+' + challenge.xp + ' XP', current.value, challenge.target, current.done);
      card.insertBefore(node('span', 'challenge-period', current.period), card.firstChild);
      host.appendChild(card);
    });
  }
  function renderNotifications(result, readIds) {
    var host = element('notification-list');
    if (!host) return;
    host.textContent = '';
    var unread = result.events.filter(function (event) { return readIds.indexOf(event.id) === -1; }).length;
    setText('notification-unread', unread);
    if (!result.events.length) {
      host.appendChild(node('p', 'empty', 'Ancora nessuna notifica. Completa un allenamento per iniziare.'));
      return;
    }
    result.events.slice().reverse().forEach(function (event) {
      var item = node('div', 'card notification-card' + (readIds.indexOf(event.id) === -1 ? ' unread' : ''));
      item.appendChild(node('span', 'reward-icon', event.icon));
      var copy = node('div', 'notification-copy');
      copy.appendChild(node('strong', '', event.title));
      copy.appendChild(node('small', '', event.description));
      copy.appendChild(node('time', '', dateLabel(event.date)));
      item.appendChild(copy);
      if (event.xp) item.appendChild(node('span', 'reward-xp', '+' + event.xp + ' XP'));
      host.appendChild(item);
    });
    var button = element('mark-notifications-read');
    if (button) button.disabled = unread === 0;
  }
  function renderProfile(result) {
    setText('profile-level', result.level);
    setText('profile-xp', result.xp);
    setText('profile-streak', result.activeStreak);
  }
  function renderStats(result) {
    if (window.location.search.indexOf('done=1') === -1 || !result.events.length) return;
    var last = result.events[result.events.length - 1];
    var earned = result.events.filter(function (event) { return event.sessionId === last.sessionId; }).reduce(function (sum, event) { return sum + event.xp; }, 0);
    var notice = element('app-notice');
    if (notice) notice.textContent = 'Allenamento salvato: +' + earned + ' XP! Controlla achievement, sfide e notifiche nella Home.';
  }
  function start() {
    var result = calculate();
    var page = document.body.getAttribute('data-page');
    if (page === 'home') renderHome(result, readIds());
    if (page === 'achievements') renderAchievements(result);
    if (page === 'challenges') renderChallenges(result);
    if (page === 'notifications') {
      renderNotifications(result, readIds());
      var button = element('mark-notifications-read');
      if (button) button.addEventListener('click', function () {
        var ids = result.events.map(function (event) { return event.id; });
        try { localStorage.setItem(READ_KEY, JSON.stringify(ids)); renderNotifications(result, ids); }
        catch (error) { setText('notification-feedback', 'Impossibile salvare la lettura in questo browser.'); }
      });
    }
    if (page === 'profile') renderProfile(result);
    if (page === 'stats') renderStats(result);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}());
