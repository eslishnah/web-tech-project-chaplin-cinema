'use strict';

// Session examples transcribed from the supplied Dostar Cinema screenshots, not a live feed.
const CinemaData = (() => {
  const films = [
    { id: 'zamanback-2', title: 'Zamanback 2', originalTitle: 'Заманback 2', poster: 'images/zamanback-2.jpg', age: 18, language: 'Kazakh', format: '2D', price: 1800, times: ['19:25', '21:30', '23:35'] },
    { id: 'bazha-kinoda', title: 'Bazha Kinoda', originalTitle: 'Бажа кинода', poster: 'images/bazha-kinoda.jpg', age: 16, language: 'Kazakh', format: '2D', price: 1800, times: ['19:40', '20:35', '21:25', '22:00', '22:25', '23:10', '00:15'] },
    { id: 'kit-vo-tme-glubin', title: 'Whalefall', originalTitle: 'Кит: Во тьме глубин', poster: 'images/kit-vo-tme-glubin.jpg', age: 16, language: 'Russian', format: '2D', price: 1800, times: ['20:00', '23:50'] }
  ];
  const showtimes = films.flatMap(film => film.times.map(time => ({
    ...film, time, session: `${film.id}-${time.replace(':', '')}`, nextDay: time === '00:15'
  })));

  // Seven real destinations: the assignment's array with 6+ objects.
  const pages = [
    { id: 'home', title: 'Home', href: 'index.html', category: 'Information', description: 'Start here and choose your next step.' },
    { id: 'movies', title: 'Movies', href: 'movies.html', category: 'Tickets', description: 'Find a film, compare age ratings and save a shortlist.' },
    { id: 'schedule', title: 'Schedule', href: 'schedule.html', category: 'Tickets', description: 'Choose a session and calculate a demo ticket order.' },
    { id: 'cinema', title: 'Cinema', href: 'cinema.html', category: 'Information', description: 'Explore the cinema and build a preparation checklist.' },
    { id: 'halls', title: 'Halls', href: 'halls.html', category: 'Feedback', description: 'Read hall facts and add a local review.' },
    { id: 'visit', title: 'Visit', href: 'visit.html', category: 'Information', description: 'Find the address, phone, map and departure planner.' },
    { id: 'services', title: 'Services', href: 'services.html', category: 'Feedback', description: 'Find visitor services and prepare a feedback message.' }
  ];

  function localDate(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function lastDemoDate(now = new Date()) {
    const date = new Date(now);
    date.setDate(date.getDate() + 30);
    return localDate(date);
  }

  function money(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(amount);
  }

  function findFilm(session) {
    return showtimes.find(showtime => showtime.session === session);
  }

  function filterFilms(query, age, savedOnly, saved, sort) {
    const result = films.filter(film =>
      `${film.title} ${film.originalTitle}`.toLowerCase().includes(query.trim().toLowerCase()) &&
      (age === '' || film.age <= Number(age)) &&
      (!savedOnly || saved.includes(film.id))
    );
    return result.sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : a.times[0].localeCompare(b.times[0]));
  }

  function emailValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function sessionErrors(selection, now = new Date()) {
    const errors = {};
    const film = findFilm(selection.session);
    if (!film) errors.session = 'Choose a film and session.';
    const date = new Date(`${selection.date}T12:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selection.date) || Number.isNaN(date.getTime()) || localDate(date) !== selection.date) {
      errors.date = 'Choose a valid date.';
    } else if (selection.date < localDate(now) || selection.date > lastDemoDate(now)) {
      errors.date = 'Choose today or a date within the next 30 days for this demo.';
    } else if (film && new Date(new Date(`${selection.date}T${film.time}:00`).getTime() + (film.nextDay ? 86400000 : 0)) <= now) {
      errors.date = 'This session time has passed. Choose another date.';
    }
    if (!Number.isInteger(Number(selection.quantity)) || Number(selection.quantity) < 1 || Number(selection.quantity) > 10) {
      errors.quantity = 'Choose a whole number from 1 to 10.';
    }
    if (selection.age === '' || !Number.isInteger(Number(selection.age)) || Number(selection.age) < 0 || Number(selection.age) > 120) {
      errors.age = 'Enter the youngest visitor’s age (0–120).';
    } else if (film && Number(selection.age) < film.age) {
      errors.age = `${film.title} is rated ${film.age}+. Choose a suitable film.`;
    }
    return errors;
  }

  function cartTotal(cart) {
    return cart.reduce((sum, item) => sum + findFilm(item.session).price * item.quantity, 0);
  }

  function ticketCount(cart) {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function demoReference(now = Date.now(), random = Math.random()) {
    return `DEMO-${now.toString(36).toUpperCase()}-${Math.floor(random * 1000000).toString().padStart(6, '0')}`;
  }

  function departureTime(date, time, minutes, buffer, now = new Date()) {
    const start = new Date(`${date}T${time}:00`);
    if (!date || !time || Number.isNaN(start.getTime()) || localDate(start) !== date || start <= now) return null;
    if (minutes === '' || buffer === '' || !Number.isInteger(Number(minutes)) || !Number.isInteger(Number(buffer)) || Number(minutes) < 1 || Number(minutes) > 360 || Number(buffer) < 0 || Number(buffer) > 120) return null;
    const leave = new Date(start.getTime() - (Number(minutes) + Number(buffer)) * 60000);
    return leave > now ? leave : null;
  }

  return { films, showtimes, pages, localDate, lastDemoDate, money, findFilm, filterFilms, emailValid, sessionErrors, cartTotal, ticketCount, demoReference, departureTime };
})();

if (typeof module !== 'undefined') module.exports = CinemaData;
