'use strict';

(() => {
  const { element, button, field, status, validateFields, errorFor, clearErrors } = CinemaUI;
  const { films, bookingDates, sessionsFor, fromPrice, money, emailValid } = CinemaData;
  const byId = id => document.getElementById(id);

  // Reuse the midterm form inside checkout. The screening and seat count come from the seat picker.
  const form = byId('booking-form');
  const fields = {
    name: byId('booking-name'), email: byId('booking-email'),
    note: byId('booking-note'), agree: byId('booking-agree')
  };
  const age = field("Youngest viewer's age", 'booking-age', 'number');
  age.wrapper.classList.add('col-12', 'col-md-6');
  age.input.min = '0';
  age.input.max = '120';
  age.input.required = true;
  fields.note.parentElement.before(age.wrapper);
  fields.age = age.input;
  fields.name.maxLength = 80;
  fields.email.maxLength = 120;
  form.noValidate = true;

  ['booking-session', 'booking-date', 'booking-tickets'].forEach(id => byId(id).parentElement.remove());
  form.querySelector('legend').textContent = 'Buyer details';
  form.querySelector('a[href="#order-summary"]').remove();
  const review = byId('booking-review');
  review.type = 'submit';
  review.textContent = 'Review tickets';
  const notice = element('p', 'small text-body-secondary', 'Contact details entered here are kept in this form.');
  notice.id = 'checkout-notice';
  const formError = byId('booking-error');
  const buyerDetails = element('div');
  buyerDetails.append(notice, form, formError);
  byId('booking').remove();

  const schedule = byId('live-schedule');
  const title = element('h2', 'h3 mb-3', 'Showtimes');
  title.id = 'booking'; // Keep existing links to schedule.html#booking working.
  const dates = bookingDates();
  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC'
  });
  const dateButtons = element('div', 'd-flex flex-wrap gap-2 mb-3');
  dateButtons.setAttribute('role', 'group');
  dateButtons.setAttribute('aria-label', 'Screening date');
  const listingError = element('p', 'is-hidden');
  listingError.setAttribute('role', 'status');
  const listing = element('div', 'd-grid gap-3');
  schedule.replaceChildren(title, dateButtons,
    element('p', 'small text-body-secondary', 'Times shown in Astana time. Confirm current screenings and prices before travelling.'),
    listingError, listing);

  let selectedDate = dates.find(date => films.some(film => sessionsFor(film, date).length)) || dates[0];
  let opening = false;
  let checkout;

  dates.forEach((date, index) => {
    const label = ['Today', 'Tomorrow'][index] || dateFormat.format(new Date(date + 'T00:00:00Z'));
    const control = button(label, () => {
      selectedDate = date;
      listingError.classList.add('is-hidden');
      renderSchedule();
    }, true);
    control.dataset.date = date;
    dateButtons.append(control);
  });

  function renderSchedule() {
    for (const control of dateButtons.children) {
      const active = control.dataset.date === selectedDate;
      control.classList.toggle('btn-success', active);
      control.classList.toggle('btn-outline-secondary', !active);
      control.setAttribute('aria-pressed', String(active));
    }

    const groups = films.map(film => ({ film, screenings: sessionsFor(film, selectedDate) }))
      .filter(({ screenings }) => screenings.length)
      .sort((a, b) => a.screenings[0].time.localeCompare(b.screenings[0].time));
    listing.replaceChildren(...groups.map(({ film, screenings }) => filmCard(film, screenings, selectedDate)));
    if (!groups.length) {
      const empty = element('p', 'text-body-secondary mb-0', 'No remaining screenings on this date. Choose another date.');
      empty.setAttribute('role', 'status');
      listing.append(empty);
    }
  }

  function filmCard(film, screenings, date) {
    const card = element('article', 'border rounded-3 p-2 p-sm-3 d-flex gap-2 gap-sm-3 align-items-start');
    const poster = element('img', 'rounded-2 flex-shrink-0');
    poster.src = film.poster;
    poster.alt = '';
    poster.width = 72;
    poster.height = 102;
    poster.loading = 'lazy';
    const info = element('div');
    const times = element('div', 'd-flex flex-wrap gap-2');
    screenings.forEach(screening => {
      const control = button(screening.time, () => openScreening(film, date, screening), true);
      control.classList.replace('btn-outline-secondary', 'btn-outline-success');
      control.dataset.session = film.id + '-' + screening.time.replace(':', '');
      control.dataset.film = film.id;
      control.setAttribute('aria-label', film.title + ' at ' + screening.time);
      times.append(control);
    });
    info.append(element('h3', 'h5 mb-1', film.title),
      element('p', 'small text-body-secondary mb-2', film.age + '+ · ' + film.language + ' · From ' + money(fromPrice(film))),
      times);
    card.append(poster, info);
    return card;
  }

  function expired(date) {
    if (selectedDate === date) renderSchedule();
    status(listingError, 'That screening has started. Choose another time.', true);
  }

  async function openScreening(film, date, screening) {
    if (opening) return;
    if (!sessionsFor(film, date).some(item => item.key === screening.key)) {
      expired(date);
      return;
    }
    opening = true;
    try {
      const booking = await import('./booking.js');
      if (date !== selectedDate) return;
      checkout = { film, date, screening, buyerDetails, onExpired: () => expired(date) };
      booking.openScreening(checkout);
    } catch {
      status(listingError, 'The seat selector could not load. Open the site through Live Server and try again.', true);
    } finally {
      opening = false;
    }
  }

  function checks() {
    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const visitorAge = Number(fields.age.value);
    const errors = [
      [fields.name, name.length < 2 || name.length > 80 ? 'Enter a name with 2 to 80 characters.' : ''],
      [fields.email, !emailValid(email) || email.length > 120 ? 'Enter a valid email address.' : ''],
      [fields.note, fields.note.value.trim().length > 500 ? 'Enter no more than 500 characters.' : ''],
      [fields.agree, fields.agree.checked ? '' : 'Confirm that you have checked the rating and understand the local preview.']
    ];
    let ageError = '';
    if (fields.age.value === '' || !Number.isInteger(visitorAge) || visitorAge < 0 || visitorAge > 120) {
      ageError = 'Enter an age from 0 to 120.';
    } else if (visitorAge < checkout.film.age) {
      ageError = 'This film is rated ' + checkout.film.age + '+.';
    }
    errors.splice(2, 0, [fields.age, ageError]);
    return errors;
  }

  form.addEventListener('input', () => {
    checks().forEach(([input, message]) => {
      if (input.getAttribute('aria-invalid') === 'true') errorFor(input, message);
    });
    formError.classList.add('is-hidden');
  });
  form.addEventListener('reset', () => {
    clearErrors(form);
    formError.classList.add('is-hidden');
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateFields(checks())) {
      status(formError, 'Check the highlighted fields before continuing.', true);
      return;
    }
    checkout.review(fields.name.value.trim());
  });

  renderSchedule();
  const oldSession = new URLSearchParams(location.search).get('session');
  if (oldSession) {
    const controls = [...listing.querySelectorAll('button[data-session]')];
    const match = controls.find(control => control.dataset.session === oldSession)
      || controls.find(control => oldSession.startsWith(control.dataset.film + '-'));
    match?.focus();
  }
})();
