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

  const tools = element('details', 'container border rounded bg-white p-3 mt-3');
  tools.append(element('summary', 'fw-semibold', 'Reading settings & find a page'));
  const readingStatus = element('p', 'mt-2 mb-0');
  readingStatus.setAttribute('role', 'status');
  let large = readStorage('dostar-large-text', false) === true;
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
  tools.classList.remove('border', 'rounded');
  tools.classList.add('rounded-4', 'shadow-sm');
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
