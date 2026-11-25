(function () {
  'use strict';

  var catalog = window.CoreFitExercises;

  function node(tag, className, text) {
    var item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function option(select, value, label) {
    var item = node('option', '', label);
    item.value = value;
    select.appendChild(item);
    return item;
  }

  function field(parent, label, control) {
    var wrapper = node('label', 'field');
    wrapper.appendChild(node('span', '', label));
    wrapper.appendChild(control);
    parent.appendChild(wrapper);
  }

  function button(parent, className, text) {
    var item = node('button', className, text);
    item.type = 'button';
    parent.appendChild(item);
    return item;
  }

  function mount(host, actions) {
    var picker = node('section', 'card exercise-picker');
    var group = node('select');
    var query = node('input');
    var exercise = node('select');
    var filters = node('details', 'exercise-picker-filters');
    var equipment = node('select');
    var collection = node('select');
    var status = node('p', 'mini-label');
    status.setAttribute('role', 'status');
    picker.setAttribute('aria-label', 'Seleziona un esercizio');

    option(group, '', 'Scegli gruppo muscolare');
    catalog.areas.forEach(function (area) {
      var options = node('optgroup');
      options.label = area[0];
      area[1].forEach(function (item) { option(options, item[0], item[1]); });
      group.appendChild(options);
    });
    field(picker, 'Gruppo muscolare', group);

    query.type = 'search';
    query.placeholder = 'Es. panca piana';
    query.autocomplete = 'off';
    field(picker, 'Cerca per nome in tutto il catalogo', query);
    field(picker, 'Esercizio', exercise);

    filters.appendChild(node('summary', '', 'Filtri esercizi'));
    option(equipment, '', 'Tutte le attrezzature');
    Object.keys(catalog.equipmentLabels).forEach(function (id) { option(equipment, id, catalog.equipmentLabels[id]); });
    field(filters, 'Attrezzatura', equipment);
    option(collection, '', 'Tutta la libreria');
    option(collection, 'favorite', 'Preferiti');
    option(collection, 'recent', 'Eseguiti di recente');
    field(filters, 'Elenco', collection);
    picker.appendChild(filters);
    picker.appendChild(status);

    var add = button(picker, 'secondary', '＋ Aggiungi esercizio');
    var favorite = button(picker, 'small-btn exercise-favorite', 'Salva nei preferiti');

    var custom = node('details', 'exercise-picker-filters');
    custom.appendChild(node('summary', '', 'Crea esercizio personalizzato'));
    var name = node('input');
    name.maxLength = 60;
    field(custom, 'Nome', name);
    var customEquipment = node('select');
    Object.keys(catalog.equipmentLabels).forEach(function (id) { option(customEquipment, id, catalog.equipmentLabels[id]); });
    customEquipment.value = 'bodyweight';
    field(custom, 'Attrezzatura', customEquipment);
    var type = node('select');
    var trackingNames = {
      weight_reps: 'Peso e ripetizioni', bodyweight_reps: 'Ripetizioni',
      weighted_bodyweight: 'Sovraccarico e ripetizioni', assisted_reps: 'Assistenza e ripetizioni',
      duration: 'Tempo', weight_duration: 'Peso e tempo', distance: 'Distanza', weight_distance: 'Peso e distanza'
    };
    Object.keys(trackingNames).forEach(function (id) { option(type, id, trackingNames[id]); });
    type.value = 'bodyweight_reps';
    field(custom, 'Dati da registrare', type);
    var customStatus = node('p', 'mini-label');
    customStatus.setAttribute('role', 'status');
    custom.appendChild(customStatus);
    var create = button(custom, 'secondary', 'Crea e aggiungi');
    picker.appendChild(custom);
    host.appendChild(picker);

    function selected() { return catalog.find(exercise.value, null, actions.custom()); }

    function updateActions() {
      var item = exercise.value ? selected() : null;
      var saved = item && actions.favorites().indexOf(item.id) !== -1;
      add.disabled = !item;
      favorite.hidden = !item;
      favorite.textContent = saved ? 'Rimuovi dai preferiti' : 'Salva nei preferiti';
      favorite.setAttribute('aria-pressed', saved ? 'true' : 'false');
    }

    function refresh(keepSelection) {
      var current = keepSelection ? exercise.value : '';
      var scoped = group.value || catalog.normalize(query.value) || equipment.value || collection.value;
      var results = scoped ? catalog.search({
        group: group.value, query: query.value, equipment: equipment.value
      }, actions.custom()) : [];
      if (collection.value) {
        var ids = collection.value === 'favorite' ? actions.favorites() : actions.recent();
        results = results.filter(function (entry) { return ids.indexOf(entry.id) !== -1; });
        if (collection.value === 'recent') results.sort(function (a, b) { return ids.indexOf(a.id) - ids.indexOf(b.id); });
      }
      exercise.textContent = '';
      option(exercise, '', 'Scegli esercizio');
      results.forEach(function (item) { option(exercise, item.id, item.name); });
      exercise.disabled = !results.length;
      if (results.some(function (item) { return item.id === current; })) exercise.value = current;
      status.textContent = !scoped ? 'Scegli un gruppo oppure cerca un esercizio per nome.' :
        results.length ? results.length + (results.length === 1 ? ' esercizio trovato' : ' esercizi trovati') :
          'Nessun esercizio corrisponde ai filtri.';
      updateActions();
    }

    group.addEventListener('change', function () {
      query.parentElement.firstElementChild.textContent = group.value ? 'Cerca nel gruppo selezionato' : 'Cerca per nome in tutto il catalogo';
      refresh(false);
    });
    query.addEventListener('input', function () { refresh(true); });
    equipment.addEventListener('change', function () { refresh(true); });
    collection.addEventListener('change', function () { refresh(true); });
    exercise.addEventListener('change', updateActions);
    [query, name].forEach(function (input) {
      input.addEventListener('keydown', function (event) { if (event.key === 'Enter') event.preventDefault(); });
    });
    add.addEventListener('click', function () {
      var item = selected();
      if (!item || !actions.add(item)) return;
      exercise.value = '';
      updateActions();
      status.textContent = item.name + ' aggiunto.';
    });
    favorite.addEventListener('click', function () {
      var item = selected();
      if (item && actions.toggleFavorite(item.id)) refresh(true);
    });
    create.addEventListener('click', function () {
      var label = name.value.trim();
      if (!catalog.normalize(label) || !group.value) {
        customStatus.textContent = 'Inserisci un nome e scegli il gruppo muscolare dal primo menu.';
        return;
      }
      var duplicate = catalog.find(null, label) || actions.custom().some(function (item) {
        return catalog.normalize(item.name) === catalog.normalize(label);
      });
      if (duplicate) {
        customStatus.textContent = 'Esiste già un esercizio con questo nome. Cercalo nella libreria.';
        return;
      }
      if (!actions.create({
        name: label, aliases: [], muscleGroups: [group.value], subgroups: [], secondaryMuscles: [],
        trackingType: type.value, equipment: customEquipment.value
      })) return;
      name.value = '';
      customStatus.textContent = '';
      custom.open = false;
      refresh(false);
      status.textContent = label + ' creato e aggiunto.';
    });

    refresh(false);
  }

  window.CoreFitExerciseSelector = { mount: mount };
}());
