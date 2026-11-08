'use strict';

const CinemaData = (() => {
  // Catalogue and screening data are local so the site works before a booking API exists.
  const films = [
    ["bazha-kinoda","Бажа кинода","bazha-kinoda.jpg",16,"Comedy","Kazakh",1400,["18:45","20:35","22:25"]],
    ["bauyr","Бауыр","bauyr.webp",14,"Drama","Kazakh",2600,["18:25","19:55","21:50","22:55"]],
    ["zamanback-2","Заманback 2","zamanback-2.jpg",18,"Comedy","Kazakh",1300,["19:10","21:30"]],
    ["kot-v-shlyape","Кот в шляпе","kotVShlyape.webp",6,"Animation","Russian",1200,["11:40","15:55","19:00"]],
    ["kit-vo-tme-glubin","Кит: Во тьме глубин","kit-vo-tme-glubin.jpg",16,"Thriller","Russian",1700,["18:35","20:00","23:50"]],
    ["obitel-zla","Обитель зла","obitel_zla.webp",18,"Horror","Russian",1700,["20:20","22:10"]],
    ["serdtse-zverya","Сердце зверя","serdze_zverya.webp",16,"Thriller","Russian",1700,["19:25","21:35"]],
    ["sumerki","Сумерки. Сага. Затмение","sumerki.webp",16,"Romance","Russian",1900,["18:30","21:00"]],
    ["clayface","Клэйфейс","calyface.webp",18,"Horror","Russian",1700,["18:55","22:30"]],
    ["ostrov-zabveniya","Остров забвения","ostrov_zabvenya.webp",6,"Animation","Russian",1700,["10:00","13:15"]],
    ["sinister","Синистер. Дом мёртвых","sinister.webp",18,"Horror","Russian",2400,["20:10","22:00"]],
    ["verity","Тайный дневник Верити","tainyi_dnevnik_veriti.webp",18,"Thriller","Russian",1700,["20:15","22:25"]],
    ["shymyr","Шымыр","shymyr.webp",18,"Action","Kazakh",1300,["17:55","21:50"]],
    ["chuzhaya-mama","Чужая мама","chuzhaiya_mama.webp",18,"Thriller","Russian",1700,["20:50","00:15"]],
    ["zver","Зверь","zver.webp",18,"Action","Russian",1800,["20:00","22:20"]],
    ["rolling-loud","Роллинг Лауд. Дикое веселье","rolling_laud.webp",18,"Comedy","Russian",1800,["19:10","21:30"]],
    ["do-poslednego-gramma","До последнего грамма","do_poslednego_gramma.webp",18,"Thriller","Russian",1700,["18:45","21:05"]],
    ["kara-tuyin","Қара түйін","kara_tuiyuin.webp",18,"Thriller","Kazakh",1900,["18:50","21:15"]],
    ["zheti-karakshi","7 қарақшы","zheti_karakshi.webp",14,"Action","Kazakh",1600,["19:20","23:30"]],
    ["most-13","Пункт назначения: Мост №13","punkt_naznacheniya.webp",21,"Horror","Russian",1900,["22:15","23:55"]],
    ["zhivaya-kniga","Живая книга","zhivaua_kniga.webp",6,"Family","Russian",1900,["13:30","18:45"]],
    ["poslednee-proklyatie","Последнее проклятие","poslednee_proklatie.webp",18,"Horror","Russian",1900,["21:10","23:10"]],
    ["shaun","Барашек Шон и Чудище Лохматое","baracher_shon.webp",6,"Animation","Russian",1200,["10:30","14:40"]],
    ["alan","Алан туралы аңыз","alan.webp",6,"Animation","Kazakh",1700,["10:20","15:20"]],
  ].map(([id, title, poster, age, category, language, price, times], index) => ({
    id, title, poster: `images/${poster}`, age, category, language, price, times,
    format: '2D', hall: index % 4 + 1
  }));

  const filmDetails = {
    bauyr: [
      ['Original title', 'Бауыр'], ['Year', '2026'], ['Country', 'Kazakhstan'],
      ['Runtime', '100 minutes'], ['Director', 'Асет Жұмақан'],
      ['Cast', 'Жанболат Найзабеков, Қуандық Жүніс, Шәкірат Елемес, Шыңғыс Рәш']
    ]
  };

  const pages = [
    { title: 'Home', href: 'index.html', category: 'Information', description: 'Welcome to Dostar Cinema.' },
    { title: 'Movies', href: 'movies.html', category: 'Tickets', description: 'Browse films, choose seats and buy tickets.' },
    { title: 'Schedule', href: 'schedule.html', category: 'Tickets', description: 'Compare screening times and start a ticket order.' },
    { title: 'Cinema', href: 'cinema.html', category: 'Information', description: 'Explore the cinema and plan a visit.' },
    { title: 'Halls', href: 'halls.html', category: 'Information', description: 'Check the published hall information and leave hall feedback.' },
    { title: 'Visit', href: 'visit.html', category: 'Information', description: 'Find the address, phone and directions.' },
    { title: 'Services & Reviews', href: 'services.html', category: 'Feedback', description: 'Check services and write a cinema review.' }
  ];

  const cinemaDay = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const currency = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

  function localDate(now = new Date()) {
    return cinemaDay.format(now);
  }

  function bookingDates(now = new Date()) {
    const today = new Date(`${localDate(now)}T12:00:00+05:00`);
    return Array.from({ length: 7 }, (_, index) => localDate(new Date(today.getTime() + index * 86400000)));
  }

  function dateLabel(date) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Almaty', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    }).format(new Date(`${date}T12:00:00+05:00`));
  }

  function sessionsFor(film, date, now = Date.now()) {
    return film.times.filter(time => new Date(`${date}T${time}:00+05:00`).getTime() > now)
      .sort().map(time => ({ time, key: `${film.id}/${date}/${time}` }));
  }

  function ticketTypes(film) {
    const student = film.id === 'bauyr' ? 1800 : Math.round(film.price * 0.8);
    const child = film.id === 'bauyr' ? 1300 : Math.round(film.price * 0.6);
    const types = [
      { id: 'adult', label: 'Adult', price: film.price },
      { id: 'student', label: 'Student', price: student, note: 'Bring your student ID.' }
    ];
    if (film.age <= 14) types.push({ id: 'child', label: 'Child', price: child, note: `For children aged ${film.age}–15.` });
    return types;
  }

  function fromPrice(film) {
    return Math.min(...ticketTypes(film).map(type => type.price));
  }

  function deviceDate(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function departureTime(date, time, minutes, buffer, now = new Date()) {
    const start = new Date(`${date}T${time}:00`);
    if (!date || !time || Number.isNaN(start.getTime()) || deviceDate(start) !== date || start <= now) return null;
    if (minutes === '' || buffer === '' || !Number.isInteger(Number(minutes)) || !Number.isInteger(Number(buffer)) ||
      Number(minutes) < 1 || Number(minutes) > 360 || Number(buffer) < 0 || Number(buffer) > 120) return null;
    const departure = new Date(start.getTime() - (Number(minutes) + Number(buffer)) * 60000);
    return departure > now ? departure : null;
  }

  function money(amount) {
    return `${currency.format(amount)} ₸`;
  }

  function filterFilms({ query, category, age, savedOnly, saved, sort }) {
    const search = query.trim().toLowerCase();
    const matches = films.filter(film =>
      film.title.toLowerCase().includes(search) &&
      (!category || film.category === category) &&
      (!age || film.age <= Number(age)) &&
      (!savedOnly || saved.includes(film.id))
    );
    return sort === 'title' ? matches.sort((a, b) => a.title.localeCompare(b.title, 'ru')) : matches;
  }

  function emailValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  return { films, filmDetails, pages, bookingDates, dateLabel, sessionsFor, ticketTypes, fromPrice, money, filterFilms, emailValid, deviceDate, departureTime };
})();

if (typeof module !== 'undefined') module.exports = CinemaData;
