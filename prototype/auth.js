(function () {
  'use strict';

  var INTRO_KEY = 'corefit-intro-seen-v1';
  var ACCOUNT_KEY = 'corefit-local-account-v1';
  var SESSION_KEY = 'corefit-local-session-v1';

  function element(id) { return document.getElementById(id); }
  function read(key) {
    try { return localStorage.getItem(key); }
    catch (error) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch (error) { return false; }
  }
  function remove(key) {
    try { localStorage.removeItem(key); }
    catch (error) { /* Storage can be unavailable in private browsing. */ }
  }
  function parse(key) {
    try { return JSON.parse(read(key) || 'null'); }
    catch (error) { return null; }
  }
  function account() {
    var saved = parse(ACCOUNT_KEY);
    return saved && saved.email && (saved.username || saved.name) && saved.salt && saved.verifier ? saved : null;
  }
  function session() {
    var saved = parse(SESSION_KEY);
    var registered = account();
    return saved && registered && saved.email === registered.email ? saved : null;
  }
  function redirect(path) { window.location.replace(path); }
  function errorMessage(message) {
    var box = element('auth-error');
    if (box) { box.textContent = message; box.hidden = false; }
  }
  function clearError() {
    var box = element('auth-error');
    if (box) box.hidden = true;
  }
  function hex(bytes) {
    return Array.prototype.map.call(bytes, function (byte) { return ('0' + byte.toString(16)).slice(-2); }).join('');
  }
  function fromHex(value) {
    var bytes = new Uint8Array(value.length / 2);
    for (var index = 0; index < bytes.length; index++) bytes[index] = parseInt(value.slice(index * 2, index * 2 + 2), 16);
    return bytes;
  }
  function verifier(password, salt) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) return Promise.reject(new Error('La verifica della password non è disponibile in questo browser.'));
    return window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']).then(function (key) {
      return window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromHex(salt), iterations: 120000, hash: 'SHA-256' }, key, 256);
    }).then(function (bits) { return hex(new Uint8Array(bits)); });
  }
  function equal(a, b) {
    if (a.length !== b.length) return false;
    var difference = 0;
    for (var index = 0; index < a.length; index++) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
    return difference === 0;
  }
  function setBusy(form, busy) {
    var button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = busy;
  }
  function beginSession(saved) {
    var username = saved.username || saved.name;
    if (!write(SESSION_KEY, JSON.stringify({ email: saved.email, username: username, name: username }))) {
      errorMessage('Impossibile mantenere l’accesso: controlla le impostazioni di archiviazione del browser.');
      return;
    }
    write(INTRO_KEY, '1');
    redirect('home.html');
  }
  function setupRegistration() {
    var form = element('register-form');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearError();
      var username = element('register-username').value.trim();
      var email = element('register-email').value.trim().toLowerCase();
      var password = element('register-password').value;
      var confirmation = element('register-confirm').value;
      if (!/^[A-Za-z0-9._]{3,24}$/.test(username) || !email || password.length < 8) { errorMessage('Inserisci uno username di 3–24 caratteri (lettere, numeri, punto o _) e una password di almeno 8 caratteri.'); return; }
      if (password !== confirmation) { errorMessage('Le due password non coincidono.'); return; }
      if (account()) { errorMessage('Su questo browser esiste già un account locale. Vai su Accedi con Email.'); return; }
      if (!window.crypto || !window.crypto.getRandomValues) { errorMessage('Questo browser non supporta la registrazione locale.'); return; }
      var salt = hex(window.crypto.getRandomValues(new Uint8Array(16)));
      setBusy(form, true);
      verifier(password, salt).then(function (hash) {
        var saved = { username: username, name: username, email: email, salt: salt, verifier: hash };
        element('register-password').value = '';
        element('register-confirm').value = '';
        if (!write(ACCOUNT_KEY, JSON.stringify(saved))) { errorMessage('Impossibile salvare l’account locale in questo browser.'); return; }
        beginSession(saved);
      }).catch(function (error) { errorMessage(error.message || 'Registrazione non riuscita. Riprova.'); }).then(function () { setBusy(form, false); });
    });
  }
  function setupEmailLogin() {
    var form = element('email-login-form');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearError();
      var saved = account();
      var identifier = element('email-login-identifier').value.trim().toLowerCase();
      if (!saved || (identifier !== saved.email.toLowerCase() && identifier !== (saved.username || saved.name).toLowerCase())) { errorMessage('Account locale non trovato. Controlla username o email, oppure registrati su questo browser.'); return; }
      setBusy(form, true);
      verifier(element('email-login-password').value, saved.salt).then(function (hash) {
        element('email-login-password').value = '';
        if (!equal(hash, saved.verifier)) { errorMessage('Password non corretta.'); return; }
        beginSession(saved);
      }).catch(function (error) { errorMessage(error.message || 'Accesso non riuscito. Riprova.'); }).then(function () { setBusy(form, false); });
    });
  }
  function populateIdentity(saved) {
    var username = (saved.username || saved.name).trim();
    var initial = username.charAt(0).toUpperCase();
    if (element('home-name')) element('home-name').textContent = username;
    if (element('home-avatar')) element('home-avatar').textContent = initial;
    if (element('profile-name')) element('profile-name').textContent = username;
    if (element('profile-avatar')) element('profile-avatar').textContent = initial;
    if (element('profile-email')) element('profile-email').textContent = saved.email;
  }
  function start() {
    var page = document.body.getAttribute('data-auth');
    var query = window.location.search;
    if (page === 'intro') {
      if (query.indexOf('replay=1') === -1) {
        if (session()) { redirect('home.html'); return; }
        if (read(INTRO_KEY) === '1') { redirect('login.html'); return; }
      }
      var finishLinks = document.querySelectorAll('[data-finish-onboarding]');
      for (var index = 0; index < finishLinks.length; index++) {
        finishLinks[index].addEventListener('click', function () { write(INTRO_KEY, '1'); });
      }
      return;
    }
    if (page === 'login' && query.indexOf('logout=1') !== -1) remove(SESSION_KEY);
    if (page === 'login' || page === 'email-login' || page === 'register') {
      if (session()) { redirect('home.html'); return; }
      if (page === 'email-login') setupEmailLogin();
      if (page === 'register') setupRegistration();
      return;
    }
    if (page === 'protected') {
      var saved = session();
      if (!saved) { redirect(read(INTRO_KEY) === '1' ? 'login.html' : 'index.html'); return; }
      populateIdentity(saved);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}());
