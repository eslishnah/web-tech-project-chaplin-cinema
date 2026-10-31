// Assignment 6 comparison archive. Do not link this file from an HTML page.

// Original plain JavaScript from js/main.js

'use strict';

const CinemaUI = (() => {
  function element(tag, classes = '', text = '') {
    const node = document.createElement(tag);
    if (classes) node.classList.add(...classes.split(' '));
    node.textContent = text;
    return node;
  }

  function button(text, action, secondary = false) {
    const node = element('button', `btn ${secondary ? 'btn-outline-secondary' : 'btn-success'} py-2 px-3`, text);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }

  function link(text, href) {
    const node = element('a', 'btn btn-success py-2 px-3', text);
    node.href = href;
    return node;
  }

  function field(label, id, type = 'text', options = []) {
    const wrapper = element('div', 'mb-3');
    const caption = element('label', 'form-label fw-semibold', label);
    caption.htmlFor = id;
    const input = element(type === 'select' ? 'select' : 'input', type === 'select' ? 'form-select' : 'form-control');
    input.id = id;
    input.name = id;
    if (type !== 'select') input.type = type;
    options.forEach(([value, text]) => {
      const option = element('option', '', text);
      option.value = value;
      input.append(option);
    });
    wrapper.append(caption, input);
    return { wrapper, input };
  }

  function renderList(container, items, render, emptyText) {
    container.replaceChildren();
    if (items.length === 0) {
      if (container.tagName === 'TBODY') {
        const row = element('tr');
        const cell = element('td', 'p-3', emptyText);
        cell.colSpan = 10;
        row.append(cell);
        container.append(row);
      } else container.append(element(container.tagName === 'UL' ? 'li' : 'p', 'p-3 border rounded', emptyText));
    }
    items.forEach(item => container.append(render(item)));
  }

  function status(node, message, error = false) {
    node.textContent = message;
    node.classList.remove('is-hidden');
    node.classList.toggle('has-error', error);
    node.classList.toggle('is-success', !error);
  }

  function errorFor(input, message) {
    const id = `${input.id}-error`;
    let error = document.getElementById(id);
    if (!error) {
      error = element('p', 'has-error mt-1 mb-0');
      error.id = id;
      input.after(error);
      input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), id].filter(Boolean).join(' '));
    }
    error.textContent = message;
    error.classList.toggle('is-hidden', message === '');
    input.classList.toggle('is-invalid', message !== '');
    input.setAttribute('aria-invalid', String(message !== ''));
  }

  function clearErrors(form) {
    form.querySelectorAll('[aria-invalid]').forEach(input => errorFor(input, ''));
  }

  function validateFields(pairs) {
    pairs.forEach(([input, message]) => errorFor(input, message || ''));
    const first = pairs.find(([, message]) => Boolean(message));
    if (first) first[0].focus();
    return !first;
  }

  function readStorage(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }

  function writeStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }

  function section(title) {
    const node = element('section', 'bg-white border rounded-4 shadow-sm p-3 p-md-4 my-4');
    node.append(element('h2', 'h3', title));
    return node;
  }

  const main = document.querySelector('main');
  main.id = main.id || 'main-content';
  main.tabIndex = -1;
  main.classList.add('flex-grow-1');
  document.body.classList.add('d-flex', 'flex-column', 'min-vh-100');
  const skip = link('Skip to main content', `#${main.id}`);
  skip.classList.add('visually-hidden-focusable');
  document.body.prepend(skip);

  // Use only existing Bootstrap/base.css classes. No generated CSS or inline styles.
  document.querySelectorAll('.text-success').forEach(node => {
    node.classList.replace('text-success', 'text-dark');
  });
  document.querySelectorAll('.btn, .nav-link').forEach(node => node.classList.add('py-2', 'px-3'));
  document.querySelectorAll('main .p-4').forEach(node => {
    node.classList.replace('p-4', 'p-3');
    node.classList.add('p-md-4');
  });
  document.querySelectorAll('main .small, main .form-text').forEach(node => node.classList.add('fs-6'));
  document.querySelectorAll('img').forEach(node => { node.loading = 'lazy'; });
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.href = 'images/dostar-front.jpg';
  document.head.append(icon);

  const isHomePage = ['','index.html'].includes(location.pathname.split('/').pop());
  let large = readStorage('dostar-large-text', false) === true;
  document.documentElement.classList.toggle('fs-4', large);
  if (isHomePage) {
  const tools = element('details', 'container border rounded bg-white p-3 mt-3');
  tools.append(element('summary', 'fw-semibold', 'Reading settings & find a page'));
  const readingStatus = element('p', 'mt-2 mb-0');
  readingStatus.setAttribute('role', 'status');
  const largeButton = button('Larger text', () => {
    large = !large;
    const saved = writeStorage('dostar-large-text', large);
    applyReading();
    readingStatus.textContent = `${large ? 'Larger' : 'Standard'} text enabled.${saved ? ' Preference saved on this device.' : ' Storage unavailable; preference applies to this page.'}`;
  });
  function applyReading() {
    document.documentElement.classList.toggle('fs-4', large);
    largeButton.setAttribute('aria-pressed', String(large));
    largeButton.classList.toggle('active', large);
    largeButton.textContent = large ? 'Use standard text' : 'Use larger text';
  }
  tools.append(largeButton, readingStatus);
  applyReading();

  const search = field('Find a page by task', 'site-search', 'search');
  const category = field('Page category', 'site-category', 'select', [['', 'All pages'], ['Tickets', 'Tickets'], ['Information', 'Information'], ['Feedback', 'Feedback']]);
  const searchRow = element('div', 'row mt-3');
  search.wrapper.classList.add('col-12', 'col-md-8');
  category.wrapper.classList.add('col-12', 'col-md-4');
  searchRow.append(search.wrapper, category.wrapper);
  const results = element('ul', 'list-group my-3');
  const count = element('p');
  count.setAttribute('role', 'status');
  function searchPages() {
    const query = search.input.value.trim().toLowerCase();
    const matches = CinemaData.pages.filter(page =>
      `${page.title} ${page.description}`.toLowerCase().includes(query) &&
      (category.input.value === '' || page.category === category.input.value)
    );
    count.textContent = `${matches.length} of ${CinemaData.pages.length} pages found.`;
    renderList(results, matches, page => {
      const item = element('li', 'list-group-item');
      const anchor = element('a', 'd-block py-2 fw-semibold text-success-emphasis', page.title);
      anchor.href = page.href;
      item.append(anchor, element('span', '', page.description));
      return item;
    }, 'No matching pages. Try “tickets”, “map” or reset the search.');
  }
  tools.append(searchRow, count, results, button('Reset page search', () => {
    search.input.value = '';
    category.input.value = '';
    searchPages();
    search.input.focus();
  }, true));
  search.input.addEventListener('input', searchPages);
  category.input.addEventListener('change', searchPages);
  tools.addEventListener('keydown', event => {
    if (event.key === 'Escape') { tools.open = false; tools.querySelector('summary').focus(); }
  });
  document.querySelector('header').after(tools);
  searchPages();
  }

  const notice = element('p', 'alert alert-info', 'Student demo: no real tickets, payments or messages are sent. Film examples are from 4 October 2026; confirm current details with the cinema before travel.');
  main.querySelector('h1').after(notice);
  return { element, button, link, field, renderList, status, errorFor, clearErrors, validateFields, readStorage, writeStorage, section };
})();

// Presentation changes stay in JavaScript; all visual rules come from existing Bootstrap classes.
(() => {
  const { element } = CinemaUI;
  const main = document.querySelector('main');
  const page = location.pathname.split('/').pop() || 'index.html';
  const descriptions = {
    'index.html': ['YOUR CINEMA IN ASTANA', 'Good films. A little time together.', 'Explore the films, plan your visit and find your next cinema moment.'],
    'movies.html': ['THE FILM COLLECTION', 'Find your next film.', 'Compare age ratings, save your favourites and choose a session that suits your visit.'],
    'schedule.html': ['PLAN YOUR SCREENING', 'From a film to your ticket basket.', 'Choose your session, check the details and review everything in one place.'],
    'cinema.html': ['BEHIND THE SCREEN', 'A closer look at Dostar.', 'Discover the venue, explore the photographs and prepare for a comfortable visit.'],
    'halls.html': ['THE CINEMA EXPERIENCE', 'Every visit has a story.', 'Explore the published hall information and share what mattered to you.'],
    'visit.html': ['FIND YOUR WAY', 'Your visit starts here.', 'Location, contact details and a personal arrival planner, together in one place.'],
    'services.html': ['MAKE THE MOST OF YOUR VISIT', 'The details that make a difference.', 'Understand the ticket journey, prepare your route and leave your feedback.']
  };

  // Remove only redundant navigation actions identified in the user's screenshots.
  document.querySelectorAll('#about .btn, #about-cinema .btn, #services .card .btn, #location a[href="cinema.html"], #now-showing > a.btn, main > a[href="schedule.html#live-schedule"]').forEach(node => node.remove());

  const heading = main.querySelector('h1');
  const [eyebrow, tagline, description] = descriptions[page] || descriptions['index.html'];
  const hero = element('section', 'bg-success text-black rounded-4 p-4 p-lg-5 mb-4 shadow-sm');
  hero.id = 'page-introduction';
  hero.setAttribute('aria-labelledby', 'page-title');
  heading.id = 'page-title';
  heading.classList.remove('text-center', 'text-md-start', 'mb-4');
  heading.classList.add('mb-3');
  heading.before(hero);
  const heroRow = element('div', 'row g-4 align-items-center');
  const heroText = element('div', page === 'index.html' ? 'col-12 col-lg-7' : 'col-12');
  heroText.append(element('p', 'badge bg-warning text-black rounded-pill px-3 py-2 text-wrap text-start mb-3', eyebrow), heading);
  heroText.append(element('p', 'h4 mb-3', tagline), element('p', 'mb-0 text-black', description));
  heroRow.append(heroText);
  if (page === 'index.html') {
    const photo = document.querySelector('#about img');
    photo.loading = 'eager';
    photo.alt = 'Entrance to Dostar Cinema';
    photo.classList.add('w-100', 'rounded-4');
    const media = element('div', 'col-12 col-lg-5');
    media.append(photo, element('p', 'small text-black mt-2 mb-0', 'Dostar Cinema · Köktal shopping centre · Astana'));
    heroRow.append(media);
    document.getElementById('about').remove();
  }
  hero.append(heroRow);

  // Keep the disclosure readable without repeating a large blue banner above every page.
  const notice = main.querySelector(':scope > .alert-info');
  if (notice) {
    notice.classList.remove('alert', 'alert-info');
    notice.classList.add('small', 'text-dark', 'border-top', 'border-success', 'pt-3', 'mt-4', 'mb-0');
    document.querySelector('footer .container').append(notice);
  }
  const tools = document.querySelector('header + details');
  if (tools) {
    tools.classList.remove('border', 'rounded');
    tools.classList.add('rounded-4', 'shadow-sm');
  }
  document.querySelector('header').classList.remove('border-4');
  document.querySelector('.navbar-nav').classList.add('gap-1');
  document.querySelector('.nav-link[aria-current="page"]').classList.add('bg-success', 'text-black', 'rounded-pill');

  document.querySelectorAll('main > section.bg-white').forEach(node => {
    node.classList.remove('rounded-3');
    node.classList.add('rounded-4', 'shadow-sm');
  });
  document.querySelectorAll('main .card').forEach(card => {
    card.classList.add('bg-white', 'border-0', 'shadow-sm', 'rounded-4', 'overflow-hidden');
    card.querySelector('.card-body')?.classList.add('p-4');
  });
  document.querySelectorAll('#visitor-paths .card-body, #services .card-body').forEach((body, index) => {
    body.prepend(element('span', 'badge rounded-pill bg-success-subtle text-success-emphasis align-self-start px-3 py-2 mb-3', `0${index % 3 + 1}`));
    body.classList.add('d-flex', 'flex-column');
    body.querySelector('a')?.classList.add('mt-auto', 'align-self-start');
  });
  document.querySelectorAll('#visitor-paths .col-md-4, #services .col-md-4').forEach(column => {
    column.classList.replace('col-md-4', 'col-lg-4');
  });

  const addFacts = (target, items) => {
    const row = element('dl', 'row g-3 mt-2 mb-0');
    items.forEach(([label, value]) => {
      const cell = element('div', 'col-12 col-md-4');
      const box = element('div', 'bg-success-subtle rounded-3 p-3 h-100');
      box.append(element('dt', 'small text-success-emphasis fw-normal mb-2', label), element('dd', 'fw-semibold mb-0', value));
      cell.append(box);
      row.append(cell);
    });
    target.append(row);
  };
  if (page === 'cinema.html') addFacts(document.getElementById('about-cinema'), [
    ['Published hall count', '4 cinema halls'], ['Published seat count', '326 seats in total'], ['Location', 'Köktal shopping centre']
  ]);
  if (page === 'visit.html') addFacts(document.getElementById('location'), [
    ['Inside the centre', 'Third floor'], ['Before travelling', 'Confirm the address and hours by phone'], ['Arrival planning', 'Allow time for your route and entry']
  ]);
  if (page === 'schedule.html') {
    const steps = element('ol', 'row g-3 list-unstyled mt-4 mb-0');
    ['Choose a session', 'Review your basket', 'Complete the demo'].forEach((text, index) => {
      const item = element('li', 'col-12 col-lg-4');
      item.append(element('span', 'badge text-bg-warning rounded-pill me-2', String(index + 1)), document.createTextNode(text));
      steps.append(item);
    });
    hero.append(steps);
  }
  if (page === 'services.html') {
    const questions = element('section', 'mt-4');
    questions.append(element('h3', 'h4 mb-3', 'A few useful details'));
    [
      ['How does the ticket order work?', 'Choose a film and date on Schedule, add tickets to your basket, then review the total and your details. This student demo does not take payment or reserve seats.'],
      ['What should I check before visiting?', 'Check the film’s age rating and language. Confirm the current session, price, address and any assistance you need directly with the cinema.'],
      ['Where does my feedback go?', 'Your feedback appears in this tab only. You can edit or delete it; it is not sent to the cinema and disappears when you reload.']
    ].forEach(([question, answer]) => {
      const detail = element('details', 'bg-light rounded-3 p-3 mb-2');
      detail.append(element('summary', 'fw-semibold', question), element('p', 'mt-3 mb-0', answer));
      questions.append(detail);
    });
    document.getElementById('services').append(questions);
  }
  const footer = document.querySelector('footer');
  footer.classList.remove('bg-dark', 'text-white');
  footer.classList.add('bg-success-subtle', 'text-dark', 'border-top', 'border-success');
  footer.querySelectorAll('.text-white').forEach(node => node.classList.replace('text-white', 'text-dark'));
  main.querySelectorAll('a:not(.btn)').forEach(node => node.classList.add('text-success-emphasis'));
  main.querySelectorAll('.form-label').forEach(node => node.classList.add('fw-semibold'));
  main.querySelectorAll('summary').forEach(node => node.classList.add('text-success-emphasis'));
})();

// Original plain JavaScript from js/movies.js

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

// Original plain JavaScript from js/reviews.js

'use strict';

// Shared review rendering and validation for Halls and Services.
function setupReviews(config) {
  const { element, button, field, renderList, status, validateFields, clearErrors } = CinemaUI;
  const byId = id => document.getElementById(id);
  const form = byId(config.form);
  form.noValidate = true;
  const name = byId(config.name);
  const message = byId(config.message);
  const topic = byId(config.topic);
  const email = config.email ? byId(config.email) : null;
  name.maxLength = 80;
  message.maxLength = 500;
  const submit = byId(config.submit);
  submit.type = 'submit';
  submit.textContent = 'Add local review';
  const result = byId(config.result);
  result.textContent = 'Reviews are stored only in this page’s memory. They are not published or sent and disappear on reload.';
  const counter = element('p', 'form-text fs-6');
  counter.id = `${config.form}-counter`;
  message.setAttribute('aria-describedby', counter.id);
  message.after(counter);
  const rating = config.rating ? byId(config.rating) : null;
  const consent = field('Display name (not your email) and review will appear below in this tab.', `${config.form}-consent`, 'checkbox');
  consent.input.classList.replace('form-control', 'form-check-input');
  consent.input.classList.add('ms-2');
  consent.input.required = true;
  submit.parentElement.before(consent.wrapper);
  const heading = element('h3', 'h4 mt-4', 'Reviews in this tab');
  const sorting = field('Review order', `${config.form}-sort`, 'select', [['new', 'Newest first'], ['old', 'Oldest first']]);
  const count = element('p');
  count.setAttribute('role', 'status');
  const cards = element('div', 'd-grid gap-3');
  cards.id = `${config.form}-cards`;
  result.after(heading, sorting.wrapper, count, cards);
  const error = byId(config.error);
  let reviews = [];
  let sequence = 0;
  let editing = null;
  function updateCounter() { counter.textContent = `${message.value.length}/500 characters. Minimum 10 non-padding characters.`; }

  function renderReview(review) {
    const card = element('article', 'border rounded p-3 bg-white text-break');
    card.append(element('h4', 'h5', review.name));
    card.append(element('p', 'fw-semibold', `${review.category}${review.rating ? ` · ${review.rating}/5` : ''}`));
    const time = element('time', 'd-block mb-2', new Date(review.created).toLocaleString());
    time.dateTime = new Date(review.created).toISOString();
    card.append(time, element('p', 'text-break', review.message));
    const actions = element('div', 'd-flex flex-wrap gap-2');
    actions.append(button('Edit review', () => {
      editing = review.id;
      name.value = review.name;
      message.value = review.message;
      topic.value = review.topic;
      if (rating) rating.value = review.rating;
      // The contact address is deliberately not stored in the review array.
      consent.input.checked = true;
      submit.textContent = 'Save changes';
      clearErrors(form);
      updateCounter();
      name.focus();
      status(result, `Editing this local review. Clear the form to cancel editing.${email ? ' Re-enter your email; it is not saved with reviews.' : ''}`);
    }), button('Delete review', () => {
      reviews = reviews.filter(item => item.id !== review.id);
      if (editing === review.id) form.reset();
      render();
      status(result, 'Local review deleted.');
      (cards.querySelector('button') || name).focus();
    }, true));
    card.append(actions);
    return card;
  }

  function render() {
    const sorted = [...reviews].sort((a, b) => sorting.input.value === 'old' ? a.id - b.id : b.id - a.id);
    const average = rating && reviews.length > 0 ? ` Average: ${(reviews.reduce((sum, item) => sum + Number(item.rating), 0) / reviews.length).toFixed(1)}/5.` : '';
    count.textContent = `${reviews.length} local reviews.${average}`;
    renderList(cards, sorted, renderReview, 'No reviews yet. Add the first local review using the form above.');
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const trimmedName = name.value.trim();
    const trimmedMessage = message.value.trim();
    const pairs = [[name, trimmedName.length < 2 || trimmedName.length > 80 ? 'Enter 2–80 characters for your name.' : '']];
    if (email) pairs.push([email, !CinemaData.emailValid(email.value) || email.value.trim().length > 120 ? 'Enter a valid email address.' : '']);
    if (rating) pairs.push([rating, !['1', '2', '3', '4', '5'].includes(rating.value) ? 'Choose a rating from 1 to 5.' : '']);
    pairs.push([topic, topic.value === '' ? 'Choose a category.' : '']);
    pairs.push([message, trimmedMessage.length < 10 || trimmedMessage.length > 500 ? 'Write a review between 10 and 500 characters.' : '']);
    pairs.push([consent.input, !consent.input.checked ? 'Confirm that the review may appear locally below.' : '']);
    if (!validateFields(pairs)) { status(error, 'Review not saved. Check the highlighted fields.', true); return; }
    const duplicate = reviews.some(review => review.id !== editing && review.name === trimmedName && review.message === trimmedMessage && review.topic === topic.value);
    if (duplicate) { status(error, 'This review is already in the list. Edit the existing review instead.', true); return; }
    const previous = reviews.find(review => review.id === editing);
    const review = {
      id: editing ?? ++sequence, name: trimmedName, message: trimmedMessage,
      topic: topic.value, category: topic.selectedOptions[0].textContent,
      rating: rating ? rating.value : '', created: previous ? previous.created : Date.now()
    };
    if (editing !== null) reviews = reviews.map(item => item.id === editing ? review : item);
    else reviews.push(review);
    form.reset();
    render();
    status(result, 'Review saved in this tab only. Nothing was sent to the cinema. You can edit or delete it below.');
  });
  form.addEventListener('input', event => {
    CinemaUI.errorFor(event.target, '');
    error.classList.add('is-hidden');
    updateCounter();
  });
  form.addEventListener('reset', () => {
    editing = null;
    submit.textContent = 'Add local review';
    clearErrors(form);
    error.classList.add('is-hidden');
    status(result, 'Form cleared. Saved local reviews remain below.');
    // Do not erase saved review cards when clearing the form.
    setTimeout(updateCounter, 0);
  });
  sorting.input.addEventListener('change', render);
  updateCounter();
  render();
}

// Original plain JavaScript from js/services.js

'use strict';

setupReviews({ form: 'service-feedback-form', name: 'service-name', email: 'service-email', message: 'service-message', topic: 'service-topic', submit: 'service-feedback-submit', result: 'service-feedback-result', error: 'service-feedback-error' });
