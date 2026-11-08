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

  function dialog(id, title, wide = false) {
    const window = element('dialog', wide
      ? 'col-11 col-md-10 col-xl-8 border-0 rounded-4 shadow p-0 overflow-auto'
      : 'col-11 col-sm-8 col-lg-5 border-0 rounded-4 shadow p-0 overflow-auto');
    window.id = id;
    const header = element('header', 'd-flex align-items-center justify-content-between gap-3 p-3 border-bottom');
    const heading = element('h2', 'h4 mb-0', title);
    heading.id = `${id}-title`;
    heading.tabIndex = -1;
    const close = button('Close', () => window.close(), true);
    header.append(heading, close);
    const body = element('div', 'p-3 p-md-4');
    window.setAttribute('aria-labelledby', heading.id);
    window.append(header, body);
    document.body.append(window);
    return { window, heading, body };
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


  return { element, button, link, dialog, field, renderList, status, errorFor, clearErrors, validateFields, readStorage, writeStorage, section };
})();

const CinemaProfile = (() => {
  const { element, button, field, dialog, validateFields, errorFor, clearErrors } = CinemaUI;
  const storageKey = 'dostar-sign-in';
  let profile = null;
  try { profile = JSON.parse(sessionStorage.getItem(storageKey)); } catch { /* Use memory. */ }

  const { window, heading, body } = dialog('profile', 'Sign in');
  const name = field('Name', 'profile-name');
  name.input.required = true;
  name.input.maxLength = 80;
  const phone = field('Phone number', 'profile-phone', 'tel');
  phone.input.required = true;
  phone.input.placeholder = '+7 700 123 45 67';
  const card = field('Card number', 'profile-card');
  card.input.required = true;
  card.input.inputMode = 'numeric';
  card.input.autocomplete = 'off';
  card.input.maxLength = 23;
  const form = element('form');
  form.noValidate = true;
  const testNumber = '4242 4242 4242 4242';
  card.input.placeholder = testNumber;
  const signIn = element('button', 'btn btn-success', 'Sign in');
  signIn.type = 'submit';
  form.append(name.wrapper, phone.wrapper, card.wrapper, signIn);
  form.prepend(element('p', 'small text-body-secondary', 'Use sample details to continue. This profile works only in this tab.'));
  const account = element('section');
  const accountStatus = element('p');
  const signOut = button('Sign out', () => {
    profile = null;
    try { sessionStorage.removeItem(storageKey); } catch { /* The in-memory profile has been cleared. */ }
    document.dispatchEvent(new Event('cinema-profile-change'));
    render();
    name.input.focus();
  }, true);
  account.append(accountStatus, signOut);
  body.append(form, account);

  function render() {
    heading.textContent = profile ? 'My profile' : 'Sign in';
    form.hidden = Boolean(profile);
    account.hidden = !profile;
    accountStatus.textContent = profile ? `Local profile: ${profile.name}.` : '';
  }

  function open(nameHint = '') {
    form.reset();
    name.input.value = nameHint;
    clearErrors(form);
    render();
    window.showModal();
    (profile ? signOut : name.input).focus();
  }

  function checks() {
    const enteredName = name.input.value.trim();
    const enteredPhone = phone.input.value.trim();
    const digits = enteredPhone.replace(/\D/g, '');
    const enteredCard = card.input.value.trim().replace(/[ -]/g, '');
    return [
      [name.input, enteredName.length < 2 || enteredName.length > 80 ? 'Enter a name with 2 to 80 characters.' : ''],
      [phone.input, !/^\+?[\d\s()-]+$/.test(enteredPhone) || digits.length < 10 || digits.length > 15 ? 'Enter a phone number with 10 to 15 digits.' : ''],
      [card.input, enteredCard === testNumber.replace(/ /g, '') ? '' : 'Use the test card number 4242 4242 4242 4242.']
    ];
  }

  form.addEventListener('input', event => {
    const check = checks().find(([input]) => input === event.target);
    if (check && event.target.getAttribute('aria-invalid') === 'true') errorFor(...check);
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateFields(checks())) return;
    // Keep only the name in the local sign-in state.
    profile = { name: name.input.value.trim() };
    try { sessionStorage.setItem(storageKey, JSON.stringify(profile)); } catch { /* Use memory. */ }
    form.reset();
    window.close();
    document.dispatchEvent(new Event('cinema-profile-change'));
  });
  window.addEventListener('close', () => { card.input.value = ''; });

  return { get: () => profile, open };
})();

const CinemaTickets = (() => {
  const { element, link, dialog, readStorage, writeStorage } = CinemaUI;
  const storageKey = 'dostar-tickets-v1';
  const { window, body } = dialog('my-tickets', 'My tickets', true);

  function read() {
    const tickets = readStorage(storageKey, []);
    return Array.isArray(tickets) ? tickets : [];
  }

  function isTaken(ticket, sessionKey, seat) {
    return ticket.sessionKey === sessionKey && ticket.seat === seat;
  }

  function save(newTickets) {
    const tickets = read();
    const taken = newTickets.some(ticket => tickets.some(item => isTaken(item, ticket.sessionKey, ticket.seat)));
    if (taken) return 'taken';
    return writeStorage(storageKey, [...newTickets, ...tickets]) ? 'saved' : 'unavailable';
  }

  function summary(ticket) {
    const list = element('dl', 'row mb-0');
    const details = [
      ['Film', ticket.title], ['Screening', `${CinemaData.dateLabel(ticket.date)} · ${ticket.time}`],
      ['Hall and seat', `Hall ${ticket.hall} · Row ${ticket.row}, seat ${ticket.number}`],
      ['Ticket type', ticket.type], ['Ticket price', CinemaData.money(ticket.subtotal)]
    ];
    if (ticket.discount) details.push(['Discount', `WEB1 · −${CinemaData.money(ticket.discount)}`]);
    details.push(['Total', CinemaData.money(ticket.total)]);
    details.forEach(([label, value]) => list.append(element('dt', 'col-sm-5', label), element('dd', 'col-sm-7', value)));
    return list;
  }

  function open() {
    const tickets = read();
    body.replaceChildren(element('p', 'text-body-secondary', 'Tickets saved in this browser.'));
    if (!tickets.length) {
      body.append(element('p', '', 'You don’t have any tickets yet.'));
      if (location.pathname.endsWith('/movies.html')) {
        body.append(CinemaUI.button('Browse movies', () => {
          window.close();
          document.getElementById('movie-search')?.focus();
        }));
      } else body.append(link('Browse movies', 'movies.html'));
    }
    tickets.forEach(ticket => {
      const card = element('article', 'border rounded-3 p-3 mb-3');
      card.append(element('h3', 'h5', ticket.title), element('p', 'text-body-secondary', `Ticket ${ticket.reference}`), summary(ticket));
      body.append(card);
    });
    window.showModal();
  }

  return { read, isTaken, save, summary, open };
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
    ['Choose a session', 'Select seats', 'Save your order locally'].forEach((text, index) => {
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
      ['How does the ticket order work?', 'Open a film in Movies or choose a session in Schedule, then select seats. The result is saved locally without payment or reservation.'],
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
  footer.querySelectorAll('a[href^="http"]').forEach(item => {
    const divider = item.nextElementSibling;
    item.remove();
    if (divider?.tagName === 'SPAN') divider.remove();
  });
  const visit = element('p', 'mt-3 mb-0');
  const visitLink = element('a', 'text-success-emphasis', 'Visit details');
  visitLink.href = 'visit.html';
  visit.append('Koktal shopping centre, third floor, Nurgisa Tlendiev Avenue, Astana. ', visitLink);
  footer.querySelector('.container').append(visit);
  footer.querySelectorAll('.text-white').forEach(node => node.classList.replace('text-white', 'text-dark'));
  main.querySelectorAll('a:not(.btn)').forEach(node => node.classList.add('text-success-emphasis'));
  main.querySelectorAll('.form-label').forEach(node => node.classList.add('fw-semibold'));
  main.querySelectorAll('summary').forEach(node => node.classList.add('text-success-emphasis'));
})();

// Group the original pages without changing their addresses.
(() => {
  const { element, button } = CinemaUI;
  const nav = document.querySelector('.navbar-nav');
  const home = nav.querySelector('a[href="index.html"]');
  if (home.hasAttribute('aria-current')) document.querySelector('.navbar-brand a').setAttribute('aria-current', 'page');
  home.closest('li').remove();

  const group = element('li', 'nav-item dropdown');
  const toggle = element('button', 'nav-link dropdown-toggle py-2 px-3', 'Cinema');
  toggle.type = 'button';
  toggle.id = 'cinema-nav-toggle';
  toggle.setAttribute('data-bs-toggle', 'dropdown');
  toggle.setAttribute('aria-expanded', 'false');
  const menu = element('ul', 'dropdown-menu');
  menu.setAttribute('aria-labelledby', toggle.id);
  for (const href of ['cinema.html', 'halls.html', 'visit.html', 'services.html']) {
    const link = nav.querySelector(`a[href="${href}"]`);
    const item = link.closest('li');
    item.classList.remove('nav-item');
    link.classList.remove('nav-link', 'bg-success', 'text-black', 'rounded-pill');
    link.classList.add('dropdown-item');
    if (href === 'services.html') link.textContent = 'Services & Reviews';
    if (link.hasAttribute('aria-current')) toggle.classList.add('active');
    menu.append(item);
  }
  group.append(toggle, menu);

  const ticketItem = element('li', 'nav-item');
  ticketItem.append(button('My tickets', CinemaTickets.open, true));
  const profileItem = element('li', 'nav-item');
  const profileButton = button('Sign in', () => CinemaProfile.open(), true);
  function updateProfileLink() {
    profileButton.textContent = CinemaProfile.get() ? 'My profile' : 'Sign in';
  }
  document.addEventListener('cinema-profile-change', updateProfileLink);
  updateProfileLink();
  profileItem.append(profileButton);
  nav.append(group, ticketItem, profileItem);
})();
