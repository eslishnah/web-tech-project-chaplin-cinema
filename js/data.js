'use strict';

// Session examples transcribed from the supplied Dostar Cinema screenshots, not a live feed.
const CinemaData = (() => {
  const films = [
    {
      id: 'zamanback-2',
      title: 'Zamanback 2',
      originalTitle: 'Заманback 2',
      poster: 'images/zamanback-2.jpg',
      age: 18,
      language: 'Kazakh',
      format: '2D',
      price: 1800,
      times: ['19:25', '21:30', '23:35'],
    },
    {
      id: 'bazha-kinoda',
      title: 'Bazha Kinoda',
      originalTitle: 'Бажа кинода',
      poster: 'images/bazha-kinoda.jpg',
      age: 16,
      language: 'Kazakh',
      format: '2D',
      price: 1800,
      times: ['19:40', '20:35', '21:25', '22:00', '22:25', '23:10', '00:15'],
    },
    {
      id: 'kit-vo-tme-glubin',
      title: 'Whalefall',
      originalTitle: 'Кит: Во тьме глубин',
      poster: 'images/kit-vo-tme-glubin.jpg',
      age: 16,
      language: 'Russian',
      format: '2D',
      price: 1800,
      times: ['20:00', '23:50'],
    },
    {
      id: 'cat-in-the-hat',
      title: 'The Cat in the Hat',
      originalTitle: 'Кот в шляпе',
      poster: 'images/cat-in-the-hat.jpg',
      age: 6,
      language: 'Russian',
      format: '2D',
      price: 1000,
      prices: { '18:05': 1300 },
      times: ['13:45', '15:55', '18:05'],
    },
    {
      id: 'qudiret',
      title: 'Qudiret',
      originalTitle: 'Құдірет',
      poster: 'images/qudiret.jpg',
      age: 12,
      language: 'Kazakh',
      format: '2D',
      price: 1000,
      prices: { '19:35': 1300, '23:50': 1800 },
      times: ['12:35', '19:35', '23:50'],
    },
    {
      id: 'little-demons',
      title: 'Little Demons Journey to the West',
      originalTitle: 'Маленькие демоны путешествуют на Запад',
      poster: 'images/little-demons.webp',
      age: 16,
      language: 'Russian',
      format: '2D',
      price: 1400,
      times: ['12:00'],
    },
  ];
  const showtimes = films.flatMap((film) =>
    film.times.map((time) => ({
      ...film,
      time,
      session: `${film.id}-${time.replace(':', '')}`,
      price: film.prices?.[time] ?? film.price,
      nextDay: time === '00:15',
    })),
  );

  // Eight visitor destinations.
  const pages = [
    {
      id: 'home',
      title: 'Home',
      href: 'index.html',
      category: 'Information',
      description: 'Start here and choose your next step.',
    },
    {
      id: 'movies',
      title: 'Movies',
      href: 'movies.html',
      category: 'Tickets',
      description: 'Find a film, compare age ratings and save a shortlist.',
    },
    {
      id: 'schedule',
      title: 'Schedule',
      href: 'schedule.html',
      category: 'Tickets',
      description: 'Compare sessions and choose a time for your visit.',
    },
    {
      id: 'booking',
      title: 'Booking',
      href: 'booking.html',
      category: 'Tickets',
      description: 'Choose seats and prepare an order.',
    },
    {
      id: 'cinema',
      title: 'Cinema',
      href: 'cinema.html',
      category: 'Information',
      description: 'Explore the cinema and build a preparation checklist.',
    },
    {
      id: 'halls',
      title: 'Halls',
      href: 'halls.html',
      category: 'Feedback',
      description: 'Read hall facts and add a local review.',
    },
    {
      id: 'visit',
      title: 'Visit',
      href: 'visit.html',
      category: 'Information',
      description: 'Find the address, phone, map and departure planner.',
    },
    {
      id: 'services',
      title: 'Services',
      href: 'services.html',
      category: 'Feedback',
      description: 'Find visitor services and prepare a feedback message.',
    },
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function findFilm(session) {
    return showtimes.find((showtime) => showtime.session === session);
  }

  function filterFilms(query, age, savedOnly, saved, sort) {
    const result = films.filter(
      (film) =>
        `${film.title} ${film.originalTitle}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()) &&
        (age === '' || film.age <= Number(age)) &&
        (!savedOnly || saved.includes(film.id)),
    );
    return result.sort((a, b) =>
      sort === 'title'
        ? a.title.localeCompare(b.title)
        : a.times[0].localeCompare(b.times[0]),
    );
  }

  function emailValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function phoneValid(value) {
    const phone = value.trim();
    const digits = phone.replace(/\D/g, '');
    return (
      /^\+?[\d\s()\-]+$/.test(phone) &&
      digits.length >= 10 &&
      digits.length <= 15
    );
  }

  function sessionErrors(selection, now = new Date()) {
    const errors = {};
    const film = findFilm(selection.session);
    if (!film) errors.session = 'Choose a film and session.';
    const date = new Date(`${selection.date}T12:00:00`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(selection.date) ||
      Number.isNaN(date.getTime()) ||
      localDate(date) !== selection.date
    ) {
      errors.date = 'Choose a valid date.';
    } else if (
      selection.date < localDate(now) ||
      selection.date > lastDemoDate(now)
    ) {
      errors.date =
        'Choose today or a date within the next 30 days.';
    } else if (
      film &&
      new Date(
        new Date(`${selection.date}T${film.time}:00`).getTime() +
          (film.nextDay ? 86400000 : 0),
      ) <= now
    ) {
      errors.date = 'This session time has passed. Choose another date.';
    }
    if (
      !Number.isInteger(Number(selection.quantity)) ||
      Number(selection.quantity) < 1 ||
      Number(selection.quantity) > 10
    ) {
      errors.quantity = 'Choose a whole number from 1 to 10.';
    }
    if (
      selection.age === '' ||
      !Number.isInteger(Number(selection.age)) ||
      Number(selection.age) < 0 ||
      Number(selection.age) > 120
    ) {
      errors.age = 'Enter the youngest visitor’s age (0–120).';
    } else if (film && Number(selection.age) < film.age) {
      errors.age = `${film.title} is rated ${film.age}+. Choose a suitable film.`;
    }
    return errors;
  }

  function cartTotal(cart) {
    return cart.reduce(
      (sum, item) => sum + findFilm(item.session).price * item.quantity,
      0,
    );
  }

  function ticketCount(cart) {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function localReference(now = Date.now(), random = Math.random()) {
    return `LOCAL-${now.toString(36).toUpperCase()}-${Math.floor(
      random * 1000000,
    )
      .toString()
      .padStart(6, '0')}`;
  }

  function departureTime(date, time, minutes, buffer, now = new Date()) {
    const start = new Date(`${date}T${time}:00`);
    if (
      !date ||
      !time ||
      Number.isNaN(start.getTime()) ||
      localDate(start) !== date ||
      start <= now
    )
      return null;
    if (
      minutes === '' ||
      buffer === '' ||
      !Number.isInteger(Number(minutes)) ||
      !Number.isInteger(Number(buffer)) ||
      Number(minutes) < 1 ||
      Number(minutes) > 360 ||
      Number(buffer) < 0 ||
      Number(buffer) > 120
    )
      return null;
    const leave = new Date(
      start.getTime() - (Number(minutes) + Number(buffer)) * 60000,
    );
    return leave > now ? leave : null;
  }

  return {
    films,
    showtimes,
    pages,
    localDate,
    lastDemoDate,
    money,
    findFilm,
    filterFilms,
    emailValid,
    phoneValid,
    sessionErrors,
    cartTotal,
    ticketCount,
    localReference,
    departureTime,
  };
})();

if (typeof module !== 'undefined') module.exports = CinemaData;
