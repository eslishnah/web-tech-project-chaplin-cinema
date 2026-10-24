'use strict';

(() => {
  const { element, button, field, renderList, readStorage, writeStorage } = CinemaUI;
  const list = document.getElementById('movie-list');
  const templates = new Map(CinemaData.films.map(film => [film.id, document.getElementById(`film-${film.id}`).cloneNode(true)]));
  const stored = readStorage('dostar-shortlist', []);
  let saved = Array.isArray(stored) ? stored.filter(id => CinemaData.films.some(film => film.id === id)) : [];
  const controls = element('div', 'row g-3 mb-4');
  const search = field('Search film titles', 'movie-search', 'search');
  const age = field('Youngest viewer’s age', 'movie-age', 'select', [['', 'Show all ratings'], ['0', 'Under 12'], ['12', '12–13'], ['14', '14 or older']]);
  const sort = field('Sort films', 'movie-sort', 'select', [['time', 'Session time'], ['title', 'Title A–Z']]);
  [search, age, sort].forEach(control => { control.wrapper.classList.add('col-12', 'col-lg-4'); controls.append(control.wrapper); });
  const resultCount = element('p', 'fw-semibold');
  resultCount.setAttribute('role', 'status');
  const saveStatus = element('p');
  saveStatus.setAttribute('role', 'status');
  let savedOnly = false;
  const shortlist = button('Show saved films', () => {
    savedOnly = !savedOnly;
    update();
  }, true);
  const reset = button('Reset filters', () => {
    search.input.value = '';
    age.input.value = '';
    sort.input.value = 'time';
    savedOnly = false;
    update();
    search.input.focus();
  }, true);
  const actions = element('div', 'd-flex flex-wrap gap-2 mb-3');
  actions.append(shortlist, reset);
  list.before(controls, actions, resultCount, saveStatus);

  function renderFilm(film) {
    const card = templates.get(film.id).cloneNode(true);
    card.classList.remove('movie-detail', 'rounded-3');
    card.classList.add('bg-white', 'rounded-4', 'shadow-sm');
    const posterColumn = card.querySelector('img').parentElement;
    posterColumn.classList.replace('col-lg-2', 'col-lg-3');
    const information = card.querySelector('h3').parentElement;
    information.classList.replace('col-lg-10', 'col-lg-9');
    card.querySelector('img').classList.add('shadow', 'rounded-4');
    card.querySelector('h3').textContent = film.title;
    card.querySelector('img').alt = `${film.title} film poster`;
    const values = card.querySelectorAll('dd');
    [ `${film.age}+`, film.language, film.time, `${CinemaData.money(film.price)} (estimate)` ].forEach((value, index) => { values[index].textContent = value; });
    card.classList.toggle('is-selected', saved.includes(film.id));
    const order = card.querySelector('a');
    order.href = `schedule.html?session=${encodeURIComponent(film.session)}#booking`;
    order.textContent = 'Choose demo tickets';
    const actions = element('div', 'd-flex flex-wrap align-items-end gap-2');
    order.before(actions);
    actions.append(order);
    const save = button(saved.includes(film.id) ? 'Remove from saved' : 'Save film', () => {
      saved = saved.includes(film.id) ? saved.filter(id => id !== film.id) : [...saved, film.id];
      const persisted = writeStorage('dostar-shortlist', saved);
      update();
      saveStatus.textContent = `${saved.length} films saved.${persisted ? '' : ' Storage unavailable; saves last until you leave this page.'}`;
      const replacement = document.getElementById(`save-${film.id}`);
      (replacement || shortlist).focus();
    }, true);
    save.id = `save-${film.id}`;
    save.setAttribute('aria-pressed', String(saved.includes(film.id)));
    save.setAttribute('aria-label', `${save.textContent}: ${film.title}`);
    actions.append(save);
    return card;
  }

  function update() {
    const matches = CinemaData.filterFilms(search.input.value, age.input.value, savedOnly, saved, sort.input.value);
    resultCount.textContent = `${matches.length} of ${CinemaData.films.length} films shown. ${saved.length} saved.`;
    shortlist.setAttribute('aria-pressed', String(savedOnly));
    shortlist.classList.toggle('active', savedOnly);
    shortlist.textContent = savedOnly ? 'Show all films' : 'Show saved films';
    renderList(list, matches, renderFilm, 'No matching films. Change the age filter or reset the filters.');
  }
  search.input.addEventListener('input', update);
  age.input.addEventListener('change', update);
  sort.input.addEventListener('change', update);
  update();
})();
