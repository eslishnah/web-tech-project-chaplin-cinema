'use strict';

$(function () {
  const featuredIds = ['bauyr', 'kot-v-shlyape', 'ostrov-zabveniya'];
  const featured = featuredIds.map(id => CinemaData.films.find(film => film.id === id)).filter(Boolean);
  if (!featured.length) return;

  const $section = $('<section>', { 'aria-labelledby': 'featured-films-title' }).addClass('mt-4');
  const $heading = $('<h2>', { id: 'featured-films-title', text: 'Featured films' }).addClass('h3 mb-0');
  const $track = $('<div>', { id: 'featured-films-track', tabindex: 0, 'aria-label': 'Scroll through featured films' })
    .addClass('row mx-0 g-0 flex-nowrap overflow-auto pb-2');

  function arrow(label, symbol) {
    return $('<button>', { type: 'button', text: symbol, 'aria-label': label, 'aria-controls': 'featured-films-track' })
      .addClass('btn btn-outline-secondary px-3');
  }

  const $previous = arrow('Previous featured film', '‹');
  const $next = arrow('Next featured film', '›');
  const $all = $('<a>', { href: 'movies.html', text: 'View all movies' }).addClass('btn btn-outline-success');
  const $actions = $('<div>').addClass('d-flex flex-wrap gap-2').append($all, $previous, $next);
  const $header = $('<div>').addClass('d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3')
    .append($heading, $actions);

  // append() builds the cards from the catalogue; on() attaches the carousel controls.
  featured.forEach(film => {
    const $card = $('<article>').addClass('ratio ratio-4x3');
    const $frame = $('<div>').addClass('overflow-hidden rounded-4 bg-dark');
    const $image = $('<img>', { src: film.poster, alt: '', loading: 'lazy' }).addClass('w-100 h-100 object-fit-cover');
    const $title = $('<h3>', { text: film.title }).addClass('h5 mb-2');
    const $link = $('<a>', {
      href: `movies.html?film=${encodeURIComponent(film.id)}`,
      text: 'See showtimes',
      'aria-label': `See showtimes for ${film.title}`
    }).addClass('btn btn-success');
    const $caption = $('<div>').addClass('position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-75 text-white')
      .append($title, $link);
    $frame.append($image, $caption);
    $card.append($frame);
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
  $('main').append($section.append($header, $track));
  updateArrows();
});
