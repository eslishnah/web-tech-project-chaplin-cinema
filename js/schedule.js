'use strict';

(() => {
  const { element, button, status } = CinemaUI;
  const { films, bookingDates, sessionsFor, fromPrice, money } = CinemaData;
  const byId = id => document.getElementById(id);

  const schedule = byId('live-schedule');
  schedule.classList.replace('border', 'border-top');
  schedule.classList.add('border-4', 'border-success');
  const title = element('h2', 'h3 mb-3', 'Showtimes');
  document.querySelector('meta[name="description"]').content =
    'Browse film showtimes by date and choose seats at Dostar Cinema.';
  const dates = bookingDates();
  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC'
  });
  const dateButtons = element('div', 'd-flex flex-wrap gap-2 mb-3');
  dateButtons.setAttribute('role', 'group');
  dateButtons.setAttribute('aria-label', 'Screening date');
  const listing = element('div', 'd-grid gap-3');
  const notice = element('p', 'is-hidden');
  notice.setAttribute('role', 'status');
  schedule.replaceChildren(title, dateButtons,
    element('p', 'small text-body-secondary', 'Select a showtime to choose seats. Times shown in Astana time. This is a saved schedule example; confirm current showtimes with the cinema before travelling.'),
    notice, listing);

  let selectedDate = dates.find(date => films.some(film => sessionsFor(film, date).length)) || dates[0];

  dates.forEach((date, index) => {
    const label = ['Today', 'Tomorrow'][index] || dateFormat.format(new Date(date + 'T00:00:00Z'));
    const control = button(label, () => {
      selectedDate = date;
      renderSchedule();
    }, true);
    control.dataset.date = date;
    dateButtons.append(control);
  });

  function renderSchedule() {
    notice.classList.add('is-hidden');
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

  function filmCard(film, screenings, screeningDate) {
    const card = element('article', 'border rounded-4 p-2 p-sm-3 d-flex gap-2 gap-sm-3 align-items-start');
    const poster = element('img', 'rounded-2 flex-shrink-0');
    poster.src = film.poster;
    poster.alt = '';
    poster.width = 72;
    poster.height = 102;
    poster.loading = 'lazy';
    const info = element('div');
    const times = element('div', 'd-flex flex-wrap gap-2');
    screenings.forEach(screening => {
      const time = button(screening.time, async () => {
        time.disabled = true;
        notice.classList.add('is-hidden');
        try {
          const booking = await import('./booking.js');
          booking.openScreening(film, screeningDate, screening.time);
        } catch {
          status(notice, 'Seat selection could not load. Please refresh the page and try again.', true);
        } finally {
          time.disabled = false;
        }
      }, true);
      time.classList.replace('btn-outline-secondary', 'btn-outline-success');
      time.classList.add('rounded-pill', 'fs-6');
      time.classList.remove('rounded-3');
      time.setAttribute('aria-label', `Choose seats for ${film.title}, ${CinemaData.dateLabel(screeningDate)}, ${screening.time}`);
      times.append(time);
    });
    info.append(element('h3', 'h5 mb-1', film.title),
      element('p', 'small text-body-secondary mb-2', film.age + '+ · ' + film.language + ' · From ' + money(fromPrice(film))),
      times);
    card.append(poster, info);
    return card;
  }

  renderSchedule();
})();
