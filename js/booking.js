const { element, button, field, dialog, status, errorFor } = CinemaUI;
const { money, ticketTypes, fromPrice, sessionsFor, bookingDates, dateLabel } = CinemaData;
const { window, heading, body } = dialog('booking-flow', 'Film details', true);

let film;
let date;
let screening;
let selectedSeats = [];
let scheduleOrder = null;
let promoCode;
let currentAccountListener = null;

function show(title, ...content) {
  clearAccountListener();
  heading.textContent = title;
  body.replaceChildren(...content);
  window.scrollTop = 0;
  if (window.open) heading.focus();
}

function filmLine() {
  return element('p', 'text-body-secondary',
    `${film.title} · ${dateLabel(date)}, ${screening.time} · Hall ${film.hall}`);
}

function details(message = '') {
  const poster = element('img', 'img-fluid rounded-3');
  poster.src = film.poster;
  poster.alt = '';
  poster.width = 240;
  poster.height = 336;
  const facts = element('dl', 'row mb-0');
  const entries = [
    ['Category', film.category], ['Age rating', `${film.age}+`],
    ['Screening language', film.language], ['Format', film.format],
    ...(CinemaData.filmDetails[film.id] || [])
  ];
  entries.forEach(([label, value]) => facts.append(element('dt', 'col-sm-5', label), element('dd', 'col-sm-7', value)));
  const info = element('div', 'row g-3 align-items-start mb-4');
  const picture = element('div', 'col-6 col-sm-4 col-lg-3');
  picture.append(poster);
  const metadata = element('div', 'col-12 col-sm-8 col-lg-9');
  metadata.append(facts);
  info.append(picture, metadata);

  const dates = bookingDates();
  if (!dates.includes(date)) date = dates[0];
  const day = field('Screening date', 'screening-date', 'select', dates.map(item => [item, dateLabel(item)]));
  day.input.value = date;
  const times = element('div', 'd-flex flex-wrap gap-2');

  function renderTimes() {
    const sessions = sessionsFor(film, date);
    times.replaceChildren();
    if (!sessions.length) {
      times.append(element('p', 'text-body-secondary mb-0', 'No more screenings on this date. Choose another date.'));
      return;
    }
    const from = fromPrice(film);
    sessions.forEach(item => times.append(button(`${item.time} · from ${money(from)}`, () => {
      screening = item;
      selectedSeats = [];
      promoCode = '';
      seats();
    }, true)));
  }
  day.input.addEventListener('change', () => {
    date = day.input.value;
    renderTimes();
  });
  renderTimes();
  const error = element('p', message ? 'has-error' : 'is-hidden', message);
  error.setAttribute('role', 'status');
  show(film.title, info, element('h3', 'h5', 'Showtimes'), error, day.wrapper, times);
}

function seats(message = '') {
  const saved = CinemaTickets.read();
  const screen = element('p', 'border-top border-4 border-secondary rounded-top text-center fw-semibold pt-2 mx-auto w-75', 'SCREEN');
  const legend = element('p', 'small text-center text-body-secondary', 'Green · Available    Grey · Taken    Yellow · Selected');
  const scroll = element('div', 'overflow-auto mb-3');
  scroll.tabIndex = 0;
  scroll.setAttribute('aria-label', 'Scrollable seat map');
  const map = element('table', 'table table-borderless table-sm w-100 mb-0 text-nowrap align-middle');
  map.setAttribute('aria-label', 'Hall seat map');
  const rows = element('tbody');

  for (let row = 1; row <= 8; row++) {
    const line = element('tr');
    const label = element('th', 'small px-1', `Row ${row}`);
    label.scope = 'row';
    line.append(label);
    for (let number = 1; number <= 10; number++) {
      const id = `${row}-${number}`;
      const taken = saved.some(ticket => CinemaTickets.isTaken(ticket, screening.key, id));
      const selected = selectedSeats.some(seat => seat.id === id);
      const style = taken ? 'btn-secondary' : selected ? 'btn-warning' : 'btn-success';
      const control = element('button', `btn ${style} btn-sm rounded-2 px-0 py-2 w-100`, String(number).padStart(2, '0'));
      control.type = 'button';
      control.disabled = taken;
      control.dataset.seat = id;
      control.setAttribute('aria-label', `Row ${row}, seat ${number}${taken ? ', taken' : ''}`);
      control.setAttribute('aria-pressed', String(!taken && selected));
      const cell = element('td');
      cell.append(control);
      line.append(cell);
    }
    rows.append(line);
  }
  // One listener handles all generated seat buttons.
  rows.addEventListener('click', event => {
    const control = event.target.closest('button[data-seat]');
    if (!control || control.disabled) return;
    const id = control.dataset.seat;
    let seat = selectedSeats.find(item => item.id === id);
    if (!seat && selectedSeats.length === 10) {
      status(notice, 'You can select up to ten seats per order.', true);
      return;
    }
    if (!seat) {
      const [row, number] = id.split('-').map(Number);
      seat = { id, row, number, type: null };
      selectedSeats.push(seat);
    }
    chooseType(seat);
  });
  map.append(rows);
  scroll.append(map);
  const notice = element('p', message ? 'has-error' : 'is-hidden', message);
  notice.setAttribute('role', 'status');
  const actions = element('div', 'd-flex flex-wrap gap-2');
  if (selectedSeats.length) {
    actions.append(button('Continue with selected seats', continueBooking), button('Clear selected seats', () => {
      selectedSeats = [];
      seats();
    }, true));
  }
  const back = scheduleOrder
    ? button('Back to Schedule', () => window.close(), true)
    : button('Back to showtimes', () => details(), true);
  actions.append(back);
  const selection = element('p', 'mb-2', selectedSeats.length
    ? `Selected: ${selectedSeats.map(seat => `row ${seat.row}, seat ${seat.number}`).join('; ')}.`
    : 'Select an available seat to begin.');
  show('Choose a seat', filmLine(), notice, screen, legend, scroll, selection, actions);
}
function continueBooking() {
  const unpriced = selectedSeats.find(seat => !seat.type);
  if (unpriced) chooseType(unpriced);
  else if (scheduleOrder) showBuyerDetails();
  else payment();
}

function showBuyerDetails() {
  const firstVisit = !scheduleOrder.review;
  scheduleOrder.review = name => {
    scheduleOrder.name = name;
    payment();
  };
  const count = selectedSeats.length;
  show('Booking details', filmLine(),
    element('p', 'fw-semibold', count === 1 ? '1 selected seat' : count + ' selected seats'),
    scheduleOrder.buyerDetails, button('Add or change seats', () => seats(), true));
  if (firstVisit) scheduleOrder.buyerDetails.querySelector('form').reset();
}

function chooseType(seat) {
  const options = element('div', 'd-grid gap-2 mb-3');
  ticketTypes(film).forEach(item => {
    const choice = button(`${item.label} · ${money(item.price)}`, () => {
      seat.type = item;
      continueBooking();
    }, true);
    choice.classList.add('w-100', 'text-start');
    if (seat.type?.id === item.id) choice.classList.add('active');
    const option = element('div');
    option.append(choice);
    if (item.note) option.append(element('p', 'small text-body-secondary mt-1 mb-0', item.note));
    options.append(option);
  });

  const actions = element('div', 'd-flex flex-wrap gap-2');
  actions.append(button('Add another seat', () => seats(), true), button('Remove this seat', () => {
    selectedSeats = selectedSeats.filter(item => item !== seat);
    seats();
  }, true));
  show('Choose a ticket type', filmLine(), element('p', 'fw-semibold', `Row ${seat.row} · Seat ${seat.number}`),
    options, actions);
}

function ticketData(seat) {
  const price = seat.type.price;
  const discount = promoCode === 'WEB1' ? Math.round(price * 0.2) : 0;
  return {
    title: film.title, date, time: screening.time, hall: film.hall,
    seat: seat.id, row: seat.row, number: seat.number, sessionKey: screening.key,
    type: seat.type.label, subtotal: price, discount, total: price - discount
  };
}

function orderSummary(tickets) {
  if (tickets.length === 1) return CinemaTickets.summary(tickets[0]);

  const summary = element('div');
  const items = element('ul', 'list-group list-group-flush mb-3');
  tickets.forEach(ticket => {
    items.append(element('li', 'list-group-item bg-transparent px-0',
      `Row ${ticket.row}, seat ${ticket.number} · ${ticket.type} · ${money(ticket.subtotal)}`));
  });
  const discount = tickets.reduce((sum, ticket) => sum + ticket.discount, 0);
  const total = tickets.reduce((sum, ticket) => sum + ticket.total, 0);
  summary.append(filmLine(), items);
  if (discount) summary.append(element('p', 'mb-1', `WEB1 discount: −${money(discount)}`));
  summary.append(element('p', 'fw-semibold mb-0', `Total for ${tickets.length} tickets: ${money(total)}`));
  return summary;
}

function payment() {
  const summary = element('div', 'bg-light rounded-3 p-3 mb-3');
  const promo = field('Promo code (optional)', 'ticket-promo');
  promo.input.maxLength = 16;
  promo.input.value = promoCode;
  promo.input.autocomplete = 'off';
  const promoResult = element('p', 'is-hidden');
  promoResult.setAttribute('role', 'status');
  const feedback = element('p', 'is-hidden mb-0');
  feedback.setAttribute('role', 'status');
  const account = element('div', 'mb-3');
  const form = element('form');
  form.noValidate = true;
  const buy = element('button', 'btn btn-success', selectedSeats.length === 1 ? 'Save ticket' : 'Save tickets');
  buy.type = 'submit';

  function renderAccount() {
    const profile = CinemaProfile.get();
    account.replaceChildren();
    if (profile) {
      account.append(element('p', 'mb-0', `Local profile: ${profile.name}.`));
    } else {
      account.append(element('p', 'mb-2', 'Sign in before buying your ticket.'),
        button('Sign in to continue', () => CinemaProfile.open(scheduleOrder?.name), true));
    }
  }
  renderAccount();

  function applyPromo() {
    const code = promo.input.value.trim().toUpperCase();
    const invalid = code !== '' && code !== 'WEB1';
    promoCode = invalid ? '' : code;
    errorFor(promo.input, invalid ? 'Invalid promo code.' : '');
    promoResult.classList.add('is-hidden');
    if (promoCode) status(promoResult, 'WEB1 applied. You saved 20%.');
    summary.replaceChildren(orderSummary(selectedSeats.map(ticketData)));
    return !invalid;
  }
  promo.input.addEventListener('input', applyPromo);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!CinemaProfile.get()) {
      status(feedback, 'Please sign in before buying a ticket.', true);
      account.querySelector('button').focus();
      return;
    }
    if (!applyPromo()) {
      promo.input.focus();
      return;
    }
    if (!sessionsFor(film, date).some(item => item.key === screening.key)) {
      if (scheduleOrder) {
        scheduleOrder.onExpired();
        window.close();
      } else details('This screening has already started. Choose another time.');
      return;
    }
    const reference = `DC-${Date.now().toString(36).toUpperCase()}`;
    const tickets = selectedSeats.map((seat, index) => ({
      ...ticketData(seat),
      reference: selectedSeats.length === 1 ? reference : `${reference}-${index + 1}`
    }));
    const outcome = CinemaTickets.save(tickets);
    if (outcome === 'taken') {
      const saved = CinemaTickets.read();
      selectedSeats = selectedSeats.filter(seat => !saved.some(ticket => CinemaTickets.isTaken(ticket, screening.key, seat.id)));
      seats('A selected seat was taken. Review your selection before buying.');
      return;
    }
    if (outcome !== 'saved') {
      status(feedback, 'Your browser could not save the tickets. Check its storage settings and try again.', true);
      return;
    }
    const message = tickets.length === 1
      ? `Ticket ${reference} is ready in My tickets.`
      : `Order ${reference} · ${tickets.length} tickets are ready in My tickets.`;
    show(tickets.length === 1 ? 'Ticket saved' : 'Tickets saved', element('p', 'is-success fw-semibold', message),
      element('p', 'small text-body-secondary', 'Saved on this device. No reservation or payment was made.'),
      orderSummary(tickets), button('Open My tickets', () => {
        window.close();
        CinemaTickets.open();
      }));
  });

  const actions = element('div', 'd-flex flex-wrap gap-2 mb-3');
  actions.append(buy, button('Add another seat', () => seats(), true),
    button('Back to ticket types', () => chooseType(selectedSeats[0]), true));
  form.append(promo.wrapper, promoResult, account, actions, feedback);
  show('Review tickets', summary, form);
  applyPromo();

  // A successful local sign-in leaves the current seat, ticket type and promo in place.
  const updateAccount = () => {
    if (!account.isConnected || !window.open) return;
    renderAccount();
    if (CinemaProfile.get()) {
      feedback.classList.add('is-hidden');
      buy.focus();
    }
  };
  currentAccountListener = updateAccount;
  document.addEventListener('cinema-profile-change', currentAccountListener);
}

function clearAccountListener() {
  document.removeEventListener('cinema-profile-change', currentAccountListener);
  currentAccountListener = null;
}
window.addEventListener('close', clearAccountListener);

function showInitial(initialFilm, initialDate, order = null) {
  film = initialFilm;
  date = initialDate;
  selectedSeats = [];
  promoCode = '';
  scheduleOrder = order;
  if (order) {
    screening = order.screening;
    seats();
  } else {
    details();
  }
  window.showModal();
  heading.focus();
}

export function openFilm(selectedFilm) {
  if (window.open) return;
  const dates = bookingDates();
  showInitial(selectedFilm, dates.find(day => sessionsFor(selectedFilm, day).length) || dates[0]);
}

export function openScreening(order) {
  if (window.open) return;
  showInitial(order.film, order.date, order);
}
