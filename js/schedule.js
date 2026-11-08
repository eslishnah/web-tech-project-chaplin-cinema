'use strict';

(() => {
  const { element, button, field, renderList, status, validateFields, errorFor, clearErrors } = CinemaUI;
  const { films, bookingDates, dateLabel, sessionsFor, fromPrice, money, emailValid } = CinemaData;
  const byId = id => document.getElementById(id);
  const form = byId('booking-form');
  const fields = {
    name: byId('booking-name'), email: byId('booking-email'), session: byId('booking-session'),
    date: byId('booking-date'), quantity: byId('booking-tickets'), note: byId('booking-note'),
    agree: byId('booking-agree')
  };
  const age = field('Youngest viewer’s age', 'booking-age', 'number');
  age.wrapper.classList.add('col-12', 'col-md-6');
  age.input.min = '0';
  age.input.max = '120';
  age.input.required = true;
  fields.quantity.parentElement.after(age.wrapper);
  fields.age = age.input;
  fields.name.maxLength = 80;
  fields.email.maxLength = 120;
  form.noValidate = true;
  byId('booking-review').type = 'submit';

  const choose = byId('booking-submit');
  choose.textContent = 'Choose seats';
  const notice = element('p', 'small text-body-secondary', 'This form previews an order. Contact details are kept on this page.');
  notice.id = 'checkout-notice';
  form.before(notice);
  byId('booking-availability').textContent = 'Choose a date within the listed week. Times are shown in Astana time.';
  byId('order-summary').querySelector('p.small').textContent =
    'This estimate uses the lowest ticket type. Choose ticket types and apply a promo code after selecting seats.';
  byId('booking-result').hidden = true;

  const dates = bookingDates();
  fields.date.min = dates[0];
  fields.date.max = dates.at(-1);
  const dateFilter = field('Show sessions for', 'schedule-date-filter', 'select', dates.map(date => [date, dateLabel(date)]));
  const table = byId('live-schedule').querySelector('.table-responsive');
  table.before(dateFilter.wrapper);
  const list = byId('session-list');
  const more = button('Show all sessions', () => {
    showAll = !showAll;
    renderTable();
  }, true);
  more.classList.add('me-2', 'mb-2');
  table.after(more);
  const error = byId('booking-error');
  let listings = [];
  let showAll = false;
  let reviewed = false;

  function renderTable() {
    renderList(list, showAll ? listings : listings.slice(0, 8), ({ film, screening }) => {
      const row = element('tr');
      const time = element('td');
      const select = button(screening.time, () => {
        fields.session.value = screening.key;
        update();
        fields.session.focus();
      }, true);
      select.setAttribute('aria-label', `Select ${film.title} at ${screening.time}`);
      time.append(select);
      row.append(element('th', '', film.title), time, element('td', '', `From ${money(fromPrice(film))}`));
      row.firstElementChild.scope = 'row';
      return row;
    }, 'No remaining screenings on this date. Choose another date.');
    more.hidden = listings.length <= 8;
    more.textContent = showAll ? 'Show fewer sessions' : `Show all ${listings.length} sessions`;
    more.setAttribute('aria-expanded', String(showAll));
    more.setAttribute('aria-controls', list.id);
  }

  function setDate(date) {
    fields.date.value = date;
    dateFilter.input.value = date;
    const previous = fields.session.value;
    listings = films.flatMap(film => sessionsFor(film, date).map(screening => ({ film, screening })))
      .sort((a, b) => a.screening.time.localeCompare(b.screening.time));
    const options = listings.map(({ film, screening }) =>
      new Option(`${screening.time} · ${film.title} (${film.age}+)`, screening.key));
    fields.session.replaceChildren(new Option('Choose a session', ''), ...options);
    if (listings.some(item => item.screening.key === previous)) fields.session.value = previous;
    showAll = false;
    renderTable();
  }

  function selection() {
    const picked = listings.find(item => item.screening.key === fields.session.value);
    return { ...picked, date: fields.date.value, quantity: Number(fields.quantity.value), name: fields.name.value.trim() };
  }

  function checks(order) {
    const visitorAge = Number(fields.age.value);
    const email = fields.email.value.trim();
    const errors = {
      name: order.name.length < 2 || order.name.length > 80 ? 'Enter a name with 2 to 80 characters.' : '',
      email: !emailValid(email) || email.length > 120 ? 'Enter a valid email address.' : '',
      date: !bookingDates().includes(order.date) ? 'Choose a date in the listed week.' : '',
      session: !order.screening || !sessionsFor(order.film, order.date).some(item => item.key === order.screening.key)
        ? 'Choose an upcoming screening.' : '',
      quantity: !Number.isInteger(order.quantity) || order.quantity < 1 || order.quantity > 10 ? 'Choose 1 to 10 tickets.' : '',
      note: fields.note.value.trim().length > 500 ? 'Enter no more than 500 characters.' : '',
      agree: fields.agree.checked ? '' : 'Confirm that you have checked the rating and understand the local preview.',
      age: fields.age.value === '' || !Number.isInteger(visitorAge) || visitorAge < 0 || visitorAge > 120
        ? 'Enter an age from 0 to 120.' : ''
    };
    if (!errors.age && order.film && visitorAge < order.film.age) errors.age = `This film is rated ${order.film.age}+.`;
    return Object.entries(fields).map(([key, input]) => [input, errors[key]]);
  }

  function renderSummary(order) {
    const validDate = dates.includes(order.date);
    const validQuantity = Number.isInteger(order.quantity) && order.quantity >= 1 && order.quantity <= 10;
    byId('order-session').textContent = order.film ? `${order.film.title} · ${order.screening.time}` : 'No session selected';
    byId('order-date').textContent = validDate ? dateLabel(order.date) : 'No valid date selected';
    byId('order-quantity').textContent = validQuantity ? String(order.quantity) : 'Choose 1 to 10 tickets';
    byId('order-unit-price').textContent = order.film ? `From ${money(fromPrice(order.film))}` : 'Choose a session';
    byId('order-total').textContent = order.film && validQuantity ? money(fromPrice(order.film) * order.quantity) : 'Not calculated';
    choose.disabled = !reviewed;
  }

  function update() {
    reviewed = false;
    const order = selection();
    checks(order).forEach(([input, message]) => {
      if (input.getAttribute('aria-invalid') === 'true') errorFor(input, message);
    });
    error.classList.add('is-hidden');
    renderSummary(order);
  }

  function saveResult(reference, tickets) {
    const first = tickets[0];
    byId('booking-result').hidden = false;
    byId('ticket-reference').textContent = reference;
    byId('ticket-session').textContent = `${first.title} · ${dateLabel(first.date)}, ${first.time}`;
    byId('ticket-quantity').textContent = String(tickets.length);
    byId('ticket-total').textContent = money(tickets.reduce((sum, ticket) => sum + ticket.total, 0));
    status(byId('booking-status'), 'Saved in My tickets on this device. No reservation or payment was made.');
  }

  dateFilter.input.addEventListener('change', () => { setDate(dateFilter.input.value); update(); });
  function onFormChange(event) {
    if (event.target === fields.date && fields.date.value !== dateFilter.input.value) setDate(fields.date.value);
    update();
  }
  form.addEventListener('input', onFormChange);
  form.addEventListener('change', onFormChange);
  form.addEventListener('reset', () => setTimeout(() => {
    clearErrors(form);
    setDate(initialDate);
    update();
  }, 0));
  form.addEventListener('submit', event => {
    event.preventDefault();
    reviewed = validateFields(checks(selection()));
    renderSummary(selection());
    if (reviewed) choose.focus();
    else status(error, 'Check the highlighted fields before continuing.', true);
  });
  choose.addEventListener('click', async () => {
    const order = selection();
    if (!reviewed || !validateFields(checks(order))) {
      reviewed = false;
      renderSummary(order);
      status(error, 'Review the current screening and your details again.', true);
      return;
    }
    try {
      const booking = await import('./booking.js');
      if (!reviewed) return;
      booking.openScreening({ ...order, onSaved: saveResult, onExpired: () => {
        setDate(order.date);
        update();
        status(error, 'That screening has started. Choose another time.', true);
      } });
    } catch {
      status(error, 'The seat selector could not load. Open the site through Live Server and try again.', true);
    }
  });

  const initialDate = dates.find(date => films.some(film => sessionsFor(film, date).length)) || dates[0];
  setDate(initialDate);
  const oldSession = new URLSearchParams(location.search).get('session');
  if (oldSession) {
    const match = listings.find(({ film, screening }) => oldSession === `${film.id}-${screening.time.replace(':', '')}`)
      || listings.find(({ film }) => oldSession.startsWith(`${film.id}-`));
    if (match) fields.session.value = match.screening.key;
  }
  renderSummary(selection());
})();
