'use strict';

$(function () {
  const trailers = [
    { title: 'Скрудж', poster: 'skrudzh.webp', videoId: 'aWJiuFSLCv4' },
    { title: 'Дюна: Часть третья', poster: 'dune_tri.jpg', videoId: 'iKSqhwnNvNY' },
    { title: 'Рамаяна: Восхождение легенды', poster: 'ramayana.webp', videoId: 'T0uGAwb5MUM' },
    { title: 'Психопатка', poster: 'psihopakta.webp', videoId: 'rOfWY4mc-Rw' },
    { title: 'Проклятье Сальмокджи', poster: 'proklatye_lsalmodji.webp', videoId: 'cUPwK_xbVxs' },
    { title: 'Махаббат жасқа қарамайды', poster: 'mahabbat_zhaska_karamaidy.webp', videoId: 'xD74CQF8RGA' },
    { title: 'Навар', poster: 'navar.webp', videoId: 'zZ3WNLIMm5w' }
  ];
  const today = new Date(CinemaData.bookingDates()[0] + 'T12:00:00Z');
  const daysUntilMonday = (8 - today.getUTCDay()) % 7 || 7;
  const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  const releaseDates = trailers.map(() => {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() + daysUntilMonday + Math.floor(Math.random() * 7));
    return dateFormat.format(day);
  });

  $('<style>').text(`
#trailer-carousel {
  --trailer-dots: #a9b2b6;
  --trailer-arrow-offset: 2%;
  background: #111c22;
  isolation: isolate;
}
.trailer-screen { height: clamp(17.5rem, 30vw, 25rem); }
.trailer-preview {
  position: absolute;
  inset: .5rem calc(var(--carousel-arrow-size) + var(--trailer-arrow-offset) + .375rem) 2.75rem;
}
.trailer-screen::after, .featured-film::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, #111c22 0%, rgba(17, 28, 34, .72) 22%, transparent 68%);
}
.trailer-preview-open .trailer-screen::after { background: #000; }
.featured-film:focus-visible::after { box-shadow: inset 0 0 0 3px #fff; }
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .featured-film img { transition: transform .25s ease; }
  .featured-film:hover img { transform: scale(1.05); }
}
.trailer-controls {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.trailer-controls button { pointer-events: auto; }
.trailer-info { position: absolute; inset-inline: 5.3% 8%; bottom: 3rem; }
.trailer-title { font-size: clamp(1.55rem, 3vw, 2.6rem); line-height: 1.1; }
.trailer-date { color: #d7dddf; font-size: clamp(.875rem, 1.3vw, 1rem); }
.trailer-play {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  padding: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  width: clamp(2.9rem, 4.5vw, 3.7rem);
  aspect-ratio: 1;
  background-color: #ef4548;
  border-color: #ef4548;
  color: #fff;
  font-size: 1.2rem;
}
.trailer-play:hover, .trailer-play:focus-visible {
  color: #fff;
  background-color: #d83640;
  border-color: #d83640;
}
.trailer-arrow-prev { left: var(--trailer-arrow-offset); }
.trailer-arrow-next { right: var(--trailer-arrow-offset); }
.trailer-dots {
  position: absolute;
  left: 50%;
  bottom: .75rem;
  transform: translateX(-50%);
}
.trailer-dot {
  width: clamp(1.35rem, 2.2vw, 1.75rem);
  height: 1.75rem;
  border: 0;
  padding: 0;
  display: grid;
  place-items: center;
}
.trailer-dot::after {
  content: '';
  width: .55rem;
  height: .55rem;
  border-radius: 50%;
  background: var(--trailer-dots);
}
.trailer-dot[aria-current="true"]::after { background: #a5c75b; }
.trailer-dot:focus-visible { outline: 2px solid #fff; outline-offset: -2px; }
@media (max-width: 767.98px) {
  .trailer-title { font-size: clamp(1.3rem, 4.8vw, 1.65rem); }
  .trailer-play, .trailer-arrow { top: 43%; }
}
`).appendTo(document.head);

  const $hero = $('#page-introduction');
  const $section = $('<section>', { id: 'trailer-carousel', 'aria-label': 'Трейлеры фильмов' })
    .addClass('position-relative text-white rounded-4 overflow-hidden shadow-sm');
  const $poster = $('<img>', { alt: '' }).addClass('d-block w-100 h-100 object-fit-cover');
  const $screen = $('<div>').addClass('trailer-screen position-relative bg-dark').append($poster);
  const $title = $('<h2>').addClass('trailer-title mb-1 text-break');
  const $date = $('<p>').addClass('trailer-date mb-0');
  const $info = $('<div>', { 'aria-live': 'polite', 'aria-atomic': 'true' })
    .addClass('trailer-info').append($title, $date);

  const $play = $('<button>', {
    type: 'button', text: '▶', title: 'Смотреть трейлер', 'aria-controls': 'trailer-preview'
  }).addClass('trailer-play btn rounded-circle');
  const $previous = $('<button>', { type: 'button', text: '‹', 'aria-label': 'Предыдущий трейлер' })
    .addClass('carousel-arrow trailer-arrow trailer-arrow-prev btn btn-outline-light');
  const $next = $('<button>', { type: 'button', text: '›', 'aria-label': 'Следующий трейлер' })
    .addClass('carousel-arrow trailer-arrow trailer-arrow-next btn btn-outline-light');
  const $dots = $('<div>', { role: 'group', 'aria-label': 'Выбор трейлера' })
    .addClass('trailer-dots d-flex align-items-center');
  const dots = trailers.map((trailer, index) => $('<button>', { type: 'button', 'aria-label': trailer.title })
    .addClass('trailer-dot btn rounded-circle')
    .on('click', () => showTrailer(index))
    .appendTo($dots));

  const $navigation = $('<div>').addClass('trailer-navigation d-flex align-items-center gap-1')
    .append($previous, $dots, $next);
  const $controls = $('<div>').addClass('trailer-controls').append($info, $play, $navigation);
  const $preview = $('<div>', { id: 'trailer-preview' })
    .addClass('trailer-preview d-none bg-black rounded-3 overflow-hidden');
  $hero.after($section.append($screen, $preview, $controls));

  let activeIndex = 0;

  function closePreview() {
    $preview.empty().addClass('d-none');
    $section.removeClass('trailer-preview-open');
    $info.add($play).removeClass('d-none');
  }

  function showTrailer(index) {
    closePreview();
    activeIndex = (index + trailers.length) % trailers.length;
    const trailer = trailers[activeIndex];
    const localPoster = `images/${trailer.poster}`;
    $poster.off('error').one('error', () => $poster.attr('src', localPoster));
    $poster.attr('src', `https://i.ytimg.com/vi/${trailer.videoId}/maxresdefault.jpg`);
    $title.text(trailer.title);
    $date.text(`In cinemas from ${releaseDates[activeIndex]}`);
    $play.attr('aria-label', `Смотреть трейлер: ${trailer.title}`);
    dots.forEach(($dot, dotIndex) => {
      $dot.attr('aria-current', dotIndex === activeIndex ? 'true' : null);
    });
  }

  $previous.on('click', () => showTrailer(activeIndex - 1));
  $next.on('click', () => showTrailer(activeIndex + 1));
  $play.on('click', () => {
    const { title, videoId } = trailers[activeIndex];
    const params = new URLSearchParams({ autoplay: '1', playsinline: '1', rel: '0' });
    const $iframe = $('<iframe>', {
      src: `https://www.youtube.com/embed/${videoId}?${params}`,
      title: `Трейлер фильма «${title}»`,
      allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
      referrerpolicy: 'strict-origin-when-cross-origin',
      allowfullscreen: true
    }).addClass('d-block w-100 h-100 border-0');
    $info.add($play).addClass('d-none');
    $section.addClass('trailer-preview-open');
    $preview.removeClass('d-none').append($iframe);
    $iframe[0].focus({ preventScroll: true });
  });
  $controls.on('keydown', event => {
    if (event.key === 'Escape' && !$preview.hasClass('d-none')) {
      closePreview();
      $play[0].focus({ preventScroll: true });
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.key === 'ArrowLeft' ? -1 : 1;
    showTrailer(activeIndex + step);
    dots[activeIndex].trigger('focus');
  });

  showTrailer(0);
});

$(function () {
  const featuredIds = [
    'bauyr', 'kot-v-shlyape', 'ostrov-zabveniya', 'zver', 'bazha-kinoda',
    'zamanback-2', 'kit-vo-tme-glubin', 'serdtse-zverya', 'clayface', 'shaun'
  ];
  const featured = featuredIds.map(id => CinemaData.films.find(film => film.id === id)).filter(Boolean);
  if (!featured.length) return;

  const $section = $('<section>', { 'aria-labelledby': 'featured-films-title' }).addClass('mt-4');
  const $heading = $('<h2>', { id: 'featured-films-title', text: 'Now Trending' }).addClass('h3 mb-0');
  const $track = $('<div>', { id: 'featured-films-track', tabindex: 0, 'aria-label': 'Scroll through trending films' })
    .addClass('row mx-0 g-0 flex-nowrap overflow-auto pb-2');

  function arrow(label, symbol) {
    return $('<button>', { type: 'button', text: symbol, 'aria-label': label, 'aria-controls': 'featured-films-track' })
      .addClass('btn btn-outline-secondary px-3');
  }

  const $previous = arrow('Previous trending film', '‹');
  const $next = arrow('Next trending film', '›');
  const $all = $('<a>', { href: 'movies.html', text: 'View all movies' }).addClass('btn btn-outline-success');
  const $actions = $('<div>').addClass('d-flex flex-wrap gap-2').append($all, $previous, $next);
  const $header = $('<div>').addClass('d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3')
    .append($heading, $actions);

  // append() builds the cards from the catalogue; on() attaches the carousel controls.
  featured.forEach(film => {
    const $card = $('<article>').addClass('ratio ratio-4x3');
    const $image = $('<img>', { src: film.poster, alt: '', loading: 'lazy' }).addClass('d-block w-100 h-100 object-fit-cover');
    const $title = $('<h3>', { text: film.title }).addClass('h5 position-absolute bottom-0 start-0 end-0 z-1 m-0 p-3 text-break');
    const $link = $('<a>', {
      href: `movies.html?film=${encodeURIComponent(film.id)}`,
      'aria-label': `See showtimes for ${film.title}`
    }).addClass('featured-film d-block overflow-hidden rounded-4 bg-dark text-white text-decoration-none');
    $card.append($link.append($image, $title));
    $track.append($('<div>').addClass('col-11 col-md-7 col-lg-5 pe-3').append($card));
  });

  const track = $track[0];

  function updateArrows() {
    $previous.prop('disabled', track.scrollLeft <= 1);
    $next.prop('disabled', track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);
  }

  function scrollFilms(direction) {
    const step = $track.children().first().outerWidth();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * step, behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  $previous.on('click', () => scrollFilms(-1));
  $next.on('click', () => scrollFilms(1));
  $track.on('scroll', updateArrows);
  $(window).on('resize', updateArrows);
  $('#trailer-carousel').after($section.append($header, $track));
  if (location.hash === '#about-cinema') document.getElementById('about-cinema')?.scrollIntoView();
  updateArrows();
});
