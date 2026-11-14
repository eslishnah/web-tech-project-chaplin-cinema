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
    const close = element('button', 'btn-close p-3');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close dialog');
    close.title = 'Close';
    close.addEventListener('click', () => window.close());
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


  return { element, button, link, dialog, field, renderList, status, errorFor, clearErrors, validateFields, readStorage, writeStorage };
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
  phone.input.inputMode = 'numeric';
  phone.input.placeholder = '77001234567';
  phone.input.addEventListener('input', () => {
    phone.input.value = phone.input.value.replace(/\D/g, '').slice(0, 11);
  });
  const phoneHint = element('div', 'form-text', '11 digits, starting with 7 or 8.');
  phoneHint.id = 'profile-phone-hint';
  phone.input.setAttribute('aria-describedby', phoneHint.id);
  phone.wrapper.append(phoneHint);
  const card = field('Card number (optional)', 'profile-card');
  card.input.inputMode = 'numeric';
  card.input.autocomplete = 'off';
  card.input.maxLength = 23;
  const form = element('form');
  form.noValidate = true;
  card.input.placeholder = '0000 0000 0000 0000';
  card.input.addEventListener('input', () => {
    const digits = card.input.value.replace(/ /g, '');
    if (/^\d{16}$/.test(digits)) card.input.value = digits.match(/\d{4}/g).join(' ');
  });
  const signIn = element('button', 'btn btn-success', 'Sign in');
  signIn.type = 'submit';
  form.append(name.wrapper, phone.wrapper, card.wrapper, signIn);
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
    const enteredCard = card.input.value.trim();
    return [
      [name.input, enteredName.length < 2 || enteredName.length > 80 ? 'Enter a name with 2 to 80 characters.' : ''],
      [phone.input, /^[78]\d{10}$/.test(enteredPhone) ? '' : 'Enter 11 digits starting with 7 or 8.'],
      [card.input, !enteredCard || /^\d{4}( \d{4}){3}$/.test(enteredCard) ? '' : 'Enter 16 digits in the format 0000 0000 0000 0000.']
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
    if (ticket.buyerName) details.splice(1, 0, ['Buyer', ticket.buyerName]);
    if (ticket.discount) details.push(['Discount', `WEB1 · −${CinemaData.money(ticket.discount)}`]);
    details.push(['Total', CinemaData.money(ticket.total)]);
    details.forEach(([label, value]) => list.append(element('dt', 'col-sm-5', label), element('dd', 'col-sm-7', value)));
    return list;
  }

  function open() {
    const tickets = read();
    body.replaceChildren();
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
  const isHome = page === 'index.html';
  const descriptions = {
    'index.html': ['Cinema in Astana', '', 'Your cinema at Koktal Shopping Centre, Astana.'],
    'movies.html': ['THE FILM COLLECTION', 'Find your next film.'],
    'schedule.html': ['PLAN YOUR SCREENING', '', 'Check which films and showtimes are listed for each day. To choose seats, open a film on Movies.'],
    'cinema.html': ['BEHIND THE SCREEN', 'A closer look at Dostar.'],
    'visit.html': ['FIND YOUR WAY', 'Your visit starts here.'],
    'services.html': ['VISITOR FEEDBACK', 'Share your cinema experience.']
  };

  // Remove only redundant navigation actions identified in the user's screenshots.
  document.querySelectorAll('#about .btn, main > a[href="schedule.html#live-schedule"]').forEach(node => node.remove());

  document.getElementById('movie-photos')?.remove();

  const heading = main.querySelector('h1');
  const isReviews = page === 'services.html';
  if (isReviews) {
    document.title = 'Dostar Cinema - Reviews';
    heading.textContent = 'Reviews at Dostar Cinema';
    document.getElementById('services').remove();
    document.getElementById('service-feedback-form').classList.add('is-hidden');
  }
  const [eyebrow, tagline, description] = descriptions[page] || descriptions['index.html'];
  const heroPadding = page === 'schedule.html' ? 'p-3 p-lg-4' : 'p-4 p-lg-5';
  const hero = element('section', 'bg-success text-black rounded-4 mb-4 shadow-sm ' + heroPadding);
  hero.id = 'page-introduction';
  hero.setAttribute('aria-labelledby', 'page-title');
  heading.id = 'page-title';
  heading.classList.remove('text-center', 'text-md-start', 'mb-4');
  heading.classList.add('mb-3');
  heading.before(hero);
  const heroRow = element('div', 'row g-4 align-items-center');
  const heroText = element('div', isHome ? 'col-12 col-lg-7' : 'col-12');
  if (eyebrow) heroText.append(element('p', 'badge bg-warning text-black rounded-pill px-3 py-2 text-wrap text-start mb-3', eyebrow));
  heroText.append(heading);
  if (tagline) heroText.append(element('p', description ? 'h4 mb-3' : 'h4 mb-0', tagline));
  if (description) heroText.append(element('p', 'mb-0 text-black', description));
  heroRow.append(heroText);
  if (isHome) {
    const photo = document.querySelector('#about img');
    photo.loading = 'eager';
    photo.alt = 'Entrance to Dostar Cinema';
    photo.classList.add('w-100', 'rounded-4');
    const media = element('div', 'col-12 col-lg-5');
    media.append(photo);
    heroRow.append(media);
    main.querySelectorAll('#about, #visitor-paths, #team').forEach(section => section.remove());
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
  if (page === 'cinema.html') {
    hero.classList.replace('mb-4', 'mb-3');
    const facts = document.getElementById('about-cinema');
    facts.replaceChildren();
    facts.classList.replace('border', 'border-top');
    facts.classList.add('border-4', 'border-success');
    facts.setAttribute('aria-label', 'Cinema information');
    addFacts(facts, [
      ['Published hall count', '4 cinema halls'], ['Published seat count', '326 seats in total'], ['Location', 'Köktal shopping centre']
    ]);
    facts.firstElementChild.classList.remove('mt-2');
    document.getElementById('cinema-gallery').classList.add(
      'bg-white', 'border-top', 'border-4', 'border-success', 'rounded-4', 'shadow-sm', 'p-3', 'p-md-4', 'mb-4'
    );
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

// Cinema photos share one dialog, with the current photo tracked by its index.
(() => {
  const gallery = document.querySelector('#cinema-gallery .row');
  if (!gallery) return;

  const { element, button, dialog } = CinemaUI;
  const photos = [...gallery.querySelectorAll('img')].map(image => image.getAttribute('src'));
  photos.push(
    'images/Снимок экрана 2026-11-12 145658.png',
    'images/Снимок экрана 2026-11-12 145723.png',
    'images/Снимок экрана 2026-11-12 145751.png',
    'images/Снимок экрана 2026-11-12 145758.png',
    'images/Снимок экрана 2026-11-12 145809.png'
  );

  const { window: viewer, heading, body } = dialog('cinema-photo-viewer', 'Cinema photographs', true);
  const image = element('img', 'd-block w-100 object-fit-contain');
  image.height = 440;
  image.alt = 'Cinema gallery photo';
  const counter = element('p', 'mb-0 text-body-secondary');
  counter.setAttribute('role', 'status');

  const preview = element('img', 'd-block object-fit-cover');
  preview.alt = '';
  const open = element('button', 'btn d-block ratio ratio-4x3 p-0 border-0 rounded-4 overflow-hidden focus-ring');
  open.type = 'button';
  open.setAttribute('aria-haspopup', 'dialog');
  open.append(preview);

  const announcement = element('p', 'visually-hidden');
  announcement.setAttribute('role', 'status');
  const indicators = element('div', 'd-flex justify-content-center gap-1 py-2');
  indicators.setAttribute('role', 'group');
  indicators.setAttribute('aria-label', 'Choose a photo');

  let currentPhoto = 0;
  const dots = photos.map((_, index) => {
    const dot = element('button', 'btn btn-sm border-0 px-1 py-0 focus-ring', '●');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Go to photo ' + (index + 1));
    dot.addEventListener('click', () => showPhoto(index));
    indicators.append(dot);
    return dot;
  });

  function showPhoto(index) {
    currentPhoto = (index + photos.length) % photos.length;
    const src = photos[currentPhoto];
    const label = 'Photo ' + (currentPhoto + 1) + ' of ' + photos.length;
    preview.src = src;
    if (viewer.open) image.src = src;
    open.setAttribute('aria-label', 'Enlarge photo ' + (currentPhoto + 1));
    announcement.textContent = label;
    counter.textContent = label;
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === currentPhoto;
      dot.classList.toggle('text-success', active);
      dot.classList.toggle('text-secondary', !active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function arrow(symbol, label, position, direction) {
    const control = element('button',
      'btn btn-light position-absolute top-50 translate-middle-y rounded-circle shadow-sm py-2 px-3 fs-5 lh-1 ' + position,
      symbol);
    control.type = 'button';
    control.setAttribute('aria-label', label);
    control.addEventListener('click', () => showPhoto(currentPhoto + direction));
    return control;
  }

  open.addEventListener('click', () => {
    image.src = photos[currentPhoto];
    viewer.showModal();
    heading.focus();
  });

  const stage = element('div', 'position-relative');
  stage.append(open, arrow('‹', 'Previous photo', 'start-0 ms-2', -1), arrow('›', 'Next photo', 'end-0 me-2', 1));
  const frame = element('div', 'text-center');
  frame.append(stage, indicators, announcement);
  const column = element('div', 'col-12 col-lg-10 col-xl-9 mx-auto');
  column.append(frame);
  gallery.replaceChildren(column);

  const controls = element('div', 'd-flex flex-wrap align-items-center justify-content-between gap-2 mb-3');
  controls.append(button('Previous', () => showPhoto(currentPhoto - 1), true), counter,
    button('Next', () => showPhoto(currentPhoto + 1), true));
  body.append(controls, image);

  [gallery, viewer].forEach(container => {
    container.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showPhoto(currentPhoto + (event.key === 'ArrowLeft' ? -1 : 1));
    });
  });

  showPhoto(0);
})();

// Group the original pages without changing their addresses.
(() => {
  const { element, button } = CinemaUI;
  const nav = document.querySelector('.navbar-nav');
  const home = nav.querySelector('a[href="index.html"]');
  if (home.hasAttribute('aria-current')) document.querySelector('.navbar-brand a').setAttribute('aria-current', 'page');
  home.closest('li').remove();

  const group = element('li', 'nav-item dropdown');
  const toggle = element('button', 'nav-link dropdown-toggle py-2 px-3', 'Details');
  toggle.type = 'button';
  toggle.id = 'cinema-nav-toggle';
  toggle.setAttribute('data-bs-toggle', 'dropdown');
  toggle.setAttribute('aria-expanded', 'false');
  const menu = element('ul', 'dropdown-menu');
  menu.setAttribute('aria-labelledby', toggle.id);
  for (const href of ['cinema.html', 'visit.html', 'services.html']) {
    const link = nav.querySelector(`a[href="${href}"]`);
    const item = link.closest('li');
    item.classList.remove('nav-item');
    link.classList.remove('nav-link', 'bg-success', 'text-black', 'rounded-pill');
    link.classList.add('dropdown-item');
    if (href === 'services.html') link.textContent = 'Reviews';
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
