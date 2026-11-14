'use strict';

const CinemaUI = (() => {
  function element(tag, classes = '', text = '') {
    const node = document.createElement(tag);
    if (classes) node.classList.add(...classes.split(' '));
    node.textContent = text;
    return node;
  }

  function button(text, action, secondary = false) {
    const node = element('button', `btn ${secondary ? 'btn-outline-secondary' : 'btn-success'} py-2 px-3 rounded-3 fw-semibold`, text);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }

  function link(text, href) {
    const node = element('a', 'btn btn-success py-2 px-3 rounded-3 fw-semibold', text);
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
  document.querySelectorAll('.btn').forEach(node => node.classList.add('py-2', 'px-3', 'rounded-3', 'fw-semibold'));
  document.querySelectorAll('.nav-link').forEach(node => node.classList.add('py-2', 'px-3'));
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
  const form = element('form');
  form.noValidate = true;
  const signIn = element('button', 'btn btn-success py-2 px-3 rounded-3 fw-semibold', 'Sign in');
  signIn.type = 'submit';
  form.append(name.wrapper, phone.wrapper, signIn);
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
    return [
      [name.input, enteredName.length < 2 || enteredName.length > 80 ? 'Enter a name with 2 to 80 characters.' : ''],
      [phone.input, /^[78]\d{10}$/.test(enteredPhone) ? '' : 'Enter 11 digits starting with 7 or 8.']
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

  return { get: () => profile, open };
})();

const CinemaTickets = (() => {
  const { element, button, field, link, dialog, readStorage, writeStorage, validateFields, status } = CinemaUI;
  const storageKey = 'dostar-tickets-v1';
  const { window, heading, body } = dialog('my-tickets', 'My tickets', true);

  function read() {
    const tickets = readStorage(storageKey, []);
    return Array.isArray(tickets) ? tickets : [];
  }

  function persist(tickets) {
    if (!writeStorage(storageKey, tickets)) return false;
    document.dispatchEvent(new Event('cinema-tickets-change'));
    return true;
  }

  function isTaken(ticket, sessionKey, seat) {
    return ticket.sessionKey === sessionKey && ticket.seat === seat;
  }

  function save(newTickets) {
    const tickets = read();
    const taken = newTickets.some(ticket => tickets.some(item => isTaken(item, ticket.sessionKey, ticket.seat)));
    if (taken) return 'taken';
    return persist([...newTickets.map(ticket => ({ ...ticket, paymentStatus: 'unpaid' })), ...tickets]) ? 'saved' : 'unavailable';
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

  function unpaid(tickets) {
    return tickets.filter(ticket => ticket.paymentStatus !== 'paid');
  }

  function total(tickets) {
    return tickets.reduce((sum, ticket) => sum + ticket.total, 0);
  }

  function ticketCard(ticket) {
    const card = element('article', 'border rounded-4 p-3 mb-3');
    const paid = ticket.paymentStatus === 'paid';
    const badge = element('p', paid ? 'badge bg-success-subtle text-success-emphasis' : 'badge bg-warning-subtle text-warning-emphasis',
      paid ? 'Paid (demo)' : 'Unpaid');
    const filmId = ticket.filmId || ticket.sessionKey?.split('/')[0];
    const film = CinemaData.films.find(item => item.id === filmId)
      || CinemaData.films.find(item => item.title === ticket.title);
    const layout = element('div', 'row g-3 align-items-start');
    const details = element('div', film ? 'col-8' : 'col-12');
    details.append(element('h4', 'h5', ticket.title), element('p', 'text-body-secondary text-break', `Ticket ${ticket.reference}`), badge, summary(ticket));
    if (!paid) {
      const feedback = element('p', 'is-hidden mt-2 mb-0');
      feedback.setAttribute('role', 'status');
      const remove = button('Remove', () => {
        const current = read();
        const saved = current.find(item => item.reference === ticket.reference);
        // Re-check the stored status in case this ticket was paid for in another tab.
        if (!saved || saved.paymentStatus === 'paid') {
          render();
          heading.focus();
          return;
        }
        if (!persist(current.filter(item => item.reference !== ticket.reference))) {
          status(feedback, 'The ticket could not be removed. Check browser storage settings and try again.', true);
          return;
        }
        render('Unpaid ticket removed.');
        heading.focus();
      }, true);
      remove.classList.replace('btn-outline-secondary', 'btn-outline-danger');
      remove.classList.add('mt-3');
      remove.setAttribute('aria-label', `Remove ticket for ${ticket.title}, row ${ticket.row}, seat ${ticket.number}`);
      details.append(remove, feedback);
    }
    layout.append(details);
    if (film) {
      const picture = element('div', 'col-4 d-flex justify-content-end');
      const poster = element('img', 'movie-poster img-fluid rounded-3');
      poster.src = film.poster;
      poster.alt = `${film.title} poster`;
      poster.loading = 'lazy';
      poster.width = 200;
      poster.height = 280;
      picture.append(poster);
      layout.append(picture);
    }
    card.append(layout);
    return card;
  }

  function ticketGroup(title, id, tickets, emptyMessage) {
    const section = element('section');
    section.setAttribute('aria-labelledby', `${id}-title`);
    const titleNode = element('h3', 'h5 mb-3', `${title} (${tickets.length})`);
    titleNode.id = `${id}-title`;
    section.append(titleNode);
    tickets.forEach(ticket => section.append(ticketCard(ticket)));
    if (!tickets.length) section.append(element('p', 'text-body-secondary mb-0', emptyMessage));
    return section;
  }

  function render(message = '') {
    const tickets = read();
    heading.textContent = 'My tickets';
    body.replaceChildren();
    if (message) {
      const confirmation = element('p', 'is-success fw-semibold', message);
      confirmation.setAttribute('role', 'status');
      body.append(confirmation);
    }
    if (!tickets.length) {
      body.append(element('p', '', 'You do not have any tickets yet.'));
      if (location.pathname.endsWith('/movies.html')) {
        body.append(button('Browse movies', () => {
          window.close();
          document.getElementById('movie-search')?.focus();
        }));
      } else body.append(link('Browse movies', 'movies.html'));
      return;
    }
    const pending = unpaid(tickets);
    const paid = tickets.filter(ticket => ticket.paymentStatus === 'paid');
    const pendingSection = ticketGroup('Unpaid', 'unpaid-tickets', pending, 'No unpaid tickets.');
    const paidSection = ticketGroup('Paid', 'paid-tickets', paid, 'No paid tickets yet.');
    paidSection.classList.add('mt-4', 'pt-4', 'border-top');
    if (pending.length) {
      const checkout = element('section', 'border-top pt-3');
      checkout.setAttribute('aria-label', 'Payment total');
      checkout.append(
        element('p', 'mb-1', `${pending.length} unpaid ticket${pending.length === 1 ? '' : 's'}`),
        element('p', 'h5 mb-3', `Total to pay: ${CinemaData.money(total(pending))}`),
        button('Pay', () => payment()),
        element('p', 'small text-body-secondary mt-2 mb-0', 'Pay for all unpaid tickets together. Demo checkout; no real charge.')
      );
      pendingSection.append(checkout);
    }
    body.append(pendingSection, paidSection);
  }

  function payment() {
    const pending = unpaid(read());
    if (!pending.length) {
      render();
      return;
    }
    const references = new Set(pending.map(ticket => ticket.reference));
    heading.textContent = 'Pay for tickets';
    const form = element('form');
    form.noValidate = true;
    const holder = field('Cardholder name', 'payment-cardholder');
    holder.input.maxLength = 80;
    const card = field('Card number', 'payment-card-number');
    card.input.inputMode = 'numeric';
    card.input.maxLength = 19;
    card.input.placeholder = '4242 4242 4242 4242';
    card.input.addEventListener('input', () => {
      const digits = card.input.value.replace(/\D/g, '').slice(0, 16);
      card.input.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    });
    const expiry = field('Expiry date (MM/YY)', 'payment-expiry');
    expiry.input.inputMode = 'numeric';
    expiry.input.maxLength = 5;
    expiry.input.placeholder = 'MM/YY';
    expiry.input.addEventListener('input', () => {
      const digits = expiry.input.value.replace(/\D/g, '').slice(0, 4);
      expiry.input.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    });
    const cvc = field('CVC', 'payment-cvc', 'password');
    cvc.input.inputMode = 'numeric';
    cvc.input.maxLength = 4;
    cvc.input.addEventListener('input', () => {
      cvc.input.value = cvc.input.value.replace(/\D/g, '').slice(0, 4);
    });
    [holder, card, expiry, cvc].forEach(item => {
      item.input.required = true;
      item.input.autocomplete = 'off';
    });
    const dates = element('div', 'row');
    expiry.wrapper.classList.add('col-7');
    cvc.wrapper.classList.add('col-5');
    dates.append(expiry.wrapper, cvc.wrapper);
    const notice = element('p', 'is-hidden');
    notice.setAttribute('role', 'status');
    const confirm = element('button', 'btn btn-success py-2 px-3 rounded-3 fw-semibold', `Pay ${CinemaData.money(total(pending))}`);
    confirm.type = 'submit';
    const actions = element('div', 'd-flex flex-wrap gap-2');
    actions.append(confirm, button('Back to My tickets', () => {
      form.reset();
      render();
      heading.focus();
    }, true));
    form.append(holder.wrapper, card.wrapper, dates, notice, actions);
    body.replaceChildren(
      element('p', 'fw-semibold', `${pending.length} ticket${pending.length === 1 ? '' : 's'} - Total: ${CinemaData.money(total(pending))}`),
      element('p', 'small text-body-secondary', 'Demo payment only. Use test card 4242 4242 4242 4242, a future expiry date and any 3-digit CVC. No money is charged and card details are not saved.'),
      form
    );
    window.scrollTop = 0;
    holder.input.focus();

    form.addEventListener('submit', event => {
      event.preventDefault();
      const digits = card.input.value.replace(/ /g, '');
      const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry.input.value);
      const today = new Date();
      const validExpiry = match && (2000 + Number(match[2])) * 12 + Number(match[1]) >= today.getFullYear() * 12 + today.getMonth() + 1;
      if (!validateFields([
        [holder.input, holder.input.value.trim().length >= 2 ? '' : 'Enter the cardholder name.'],
        [card.input, /^\d{16}$/.test(digits) ? '' : 'Enter 16 digits for the card number.'],
        [expiry.input, validExpiry ? '' : 'Enter a valid expiry date that has not passed (MM/YY).'],
        [cvc.input, /^\d{3,4}$/.test(cvc.input.value) ? '' : 'Enter a 3 or 4-digit CVC.']
      ])) return;

      // Re-read before saving so paid tickets cannot be charged twice and new tickets are not silently included.
      const tickets = read();
      const current = unpaid(tickets);
      if (current.length !== pending.length || current.some(ticket => !references.has(ticket.reference)) || total(current) !== total(pending)) {
        form.reset();
        render();
        const changed = element('p', 'has-error', 'Your tickets changed. Review the total and select Pay again.');
        changed.setAttribute('role', 'alert');
        body.prepend(changed);
        heading.focus();
        return;
      }
      const paidAt = new Date().toISOString();
      const updated = tickets.map(ticket => references.has(ticket.reference)
        ? { ...ticket, paymentStatus: 'paid', paidAt }
        : ticket);
      if (!persist(updated)) {
        status(notice, 'Payment could not be saved. Check browser storage settings and try again.', true);
        return;
      }
      form.reset();
      render(`Demo payment completed for ${pending.length} ticket${pending.length === 1 ? '' : 's'}. Total: ${CinemaData.money(total(pending))}.`);
      window.scrollTop = 0;
      heading.focus();
    });
  }

  function open() {
    render();
    if (!window.open) window.showModal();
    heading.focus();
  }

  // Remove the payment form and its values when the dialog is dismissed, including with Escape.
  window.addEventListener('close', () => {
    body.querySelector('form')?.reset();
    body.replaceChildren();
  });

  return { read, isTaken, save, summary, open, unpaidCount: () => unpaid(read()).length };
})();

// Presentation changes stay in JavaScript; all visual rules come from existing Bootstrap classes.
(() => {
  const { element } = CinemaUI;
  const main = document.querySelector('main');
  const page = location.pathname.split('/').pop() || 'index.html';
  const isHome = page === 'index.html';
  const isCinema = page === 'cinema.html';
  if (isCinema && !CinemaData.cinemaPageEnabled) {
    location.replace('index.html#about-cinema');
    return;
  }
  const descriptions = {
    'index.html': ['CINEMA IN ASTANA', '', 'Your cinema at Koktal Shopping Centre, Astana.'],
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
  const heroPadding = 'p-4 p-lg-5';
  const hero = element('section', 'bg-success text-black rounded-4 mb-4 shadow-sm ' + heroPadding);
  hero.id = 'page-introduction';
  hero.setAttribute('aria-labelledby', 'page-title');
  heading.id = 'page-title';
  heading.classList.remove('text-center', 'text-md-start', 'mb-4');
  heading.classList.add('mb-3');
  heading.before(hero);
  const heroRow = element('div', 'row g-4 align-items-center');
  const heroText = element('div', 'col-12');
  if (eyebrow) heroText.append(element('p', 'badge bg-warning text-black rounded-pill px-3 py-2 text-wrap text-start mb-3', eyebrow));
  heroText.append(heading);
  if (tagline) heroText.append(element('p', description ? 'h4 mb-3' : 'h4 mb-0', tagline));
  if (description) heroText.append(element('p', 'mb-0 text-black', description));
  heroRow.append(heroText);
  if (isHome) {
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
    card.classList.remove('rounded-3');
    card.classList.add('bg-white', 'border-0', 'shadow-sm', 'rounded-4', 'overflow-hidden');
    card.querySelector('.card-body')?.classList.add('p-4');
  });

  if (isHome || isCinema) {
    document.head.append(element('style', '', `
:is(#trailer-carousel, #cinema-gallery) {
  --carousel-arrow-size: clamp(2.25rem, 3.5vw, 2.75rem);
}
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  padding: 0;
  width: var(--carousel-arrow-size);
  aspect-ratio: 1;
  font-size: 1.5rem;
  line-height: 1;
  background-color: rgba(16, 24, 29, .5);
  border-color: rgba(255, 255, 255, .65);
}
`));
  }

  const addFacts = (target, items) => {
    const row = element('dl', 'row g-3 mb-0');
    items.forEach(([label, value]) => {
      const cell = element('div', 'col-12 col-md-4');
      const box = element('div', 'bg-success-subtle rounded-3 p-3 h-100');
      box.append(element('dt', 'small text-success-emphasis fw-normal mb-2', label), element('dd', 'fw-semibold mb-0', value));
      cell.append(box);
      row.append(cell);
    });
    target.append(row);
  };
  if (isCinema || (isHome && !CinemaData.cinemaPageEnabled)) {
    const panelClasses = ['bg-white', 'border-top', 'border-4', 'border-success', 'rounded-4', 'shadow-sm', 'p-3', 'p-md-4', 'mb-4'];
    let facts = document.getElementById('about-cinema');
    let gallery = document.getElementById('cinema-gallery');

    if (isHome) {
      facts = element('section', 'mt-4');
      facts.id = 'about-cinema';
      gallery = element('section');
      gallery.id = 'cinema-gallery';
      gallery.append(element('h2', 'h3 text-dark', 'Cinema photographs'), element('div', 'row g-4'));
      main.append(facts, gallery);
    } else {
      hero.classList.replace('mb-4', 'mb-3');
      facts.replaceChildren();
      facts.classList.remove('border');
    }
    facts.classList.add(...panelClasses);
    facts.setAttribute('aria-label', 'Cinema information');
    addFacts(facts, [
      ['Published hall count', '4 cinema halls'], ['Published seat count', '326 seats in total'], ['Location', 'Köktal shopping centre']
    ]);
    gallery.classList.add(...panelClasses);
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

// Track the current cinema photo by its index.
(() => {
  const gallery = document.querySelector('#cinema-gallery .row');
  if (!gallery) return;

  const { element } = CinemaUI;
  const photos = [
    'images/dostar-bar.jpg',
    'images/dostar-front.jpg',
    'images/dostar-lobby.jpg',
    'images/Снимок экрана 2026-11-12 145658.png',
    'images/Снимок экрана 2026-11-12 145723.png',
    'images/Снимок экрана 2026-11-12 145751.png',
    'images/Снимок экрана 2026-11-12 145758.png',
    'images/Снимок экрана 2026-11-12 145809.png'
  ];

  const preview = element('img', 'd-block object-fit-cover');
  preview.alt = 'Dostar Cinema interior';
  const photoFrame = element('div', 'd-block ratio ratio-4x3 rounded-4 overflow-hidden');
  photoFrame.append(preview);

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
    announcement.textContent = label;
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
      'carousel-arrow btn btn-outline-light ' + position,
      symbol);
    control.type = 'button';
    control.setAttribute('aria-label', label);
    control.addEventListener('click', () => showPhoto(currentPhoto + direction));
    return control;
  }

  const stage = element('div', 'position-relative');
  stage.append(photoFrame, arrow('‹', 'Previous photo', 'start-0 ms-2', -1), arrow('›', 'Next photo', 'end-0 me-2', 1));
  const frame = element('div', 'text-center');
  frame.append(stage, indicators, announcement);
  const column = element('div', 'col-12 col-lg-10 col-xl-9 mx-auto');
  column.append(frame);
  gallery.replaceChildren(column);

  gallery.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showPhoto(currentPhoto + (event.key === 'ArrowLeft' ? -1 : 1));
  });

  showPhoto(0);
})();

// Group the active information pages in the Details menu.
(() => {
  const { element, button } = CinemaUI;
  const nav = document.querySelector('.navbar-nav');
  const brandLink = document.querySelector('header .navbar-brand a');
  brandLink.replaceWith(element('span', brandLink.className, brandLink.textContent));

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
    if (href === 'cinema.html' && !CinemaData.cinemaPageEnabled) {
      item.remove();
      continue;
    }
    item.classList.remove('nav-item');
    link.classList.remove('nav-link', 'bg-success', 'text-black', 'rounded-pill');
    link.classList.add('dropdown-item');
    if (href === 'services.html') link.textContent = 'Reviews';
    if (link.hasAttribute('aria-current')) toggle.classList.add('active');
    menu.append(item);
  }
  group.append(toggle, menu);

  const ticketItem = element('li', 'nav-item');
  const ticketButton = button('My tickets', CinemaTickets.open);
  function updateTicketCount() {
    const count = CinemaTickets.unpaidCount();
    ticketButton.textContent = count ? `My tickets \u00b7 ${count}` : 'My tickets';
    ticketButton.setAttribute('aria-label', `My tickets, ${count} unpaid ticket${count === 1 ? '' : 's'}`);
  }
  document.addEventListener('cinema-tickets-change', updateTicketCount);
  window.addEventListener('storage', event => {
    if (event.key === 'dostar-tickets-v1' || event.key === null) updateTicketCount();
  });
  updateTicketCount();
  ticketItem.append(ticketButton);
  const profileItem = element('li', 'nav-item');
  const profileButton = button('Sign in', () => CinemaProfile.open(), true);
  profileButton.classList.replace('btn-outline-secondary', 'btn-outline-success');
  function updateProfileLink() {
    profileButton.textContent = CinemaProfile.get() ? 'My profile' : 'Sign in';
  }
  document.addEventListener('cinema-profile-change', updateProfileLink);
  updateProfileLink();
  profileItem.append(profileButton);
  nav.append(group, ticketItem, profileItem);
})();
