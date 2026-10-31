'use strict';

// jQuery 3.7.1 full build loads before this deferred script, including its effects module.
$(function () {
  // .append(), .addClass() and .on() replace createElement()/append(), classList and addEventListener().
  // Filtering and delegated buttons are shorter; cards now come directly from the film array.
  const $list = $('#movie-list');
  const stored = CinemaUI.readStorage('dostar-shortlist', []);
  let saved = Array.isArray(stored) ? stored.filter(id => CinemaData.films.some(film => film.id === id)) : [];
  let savedOnly = false;

  function control(label, id, type, options = []) {
    const $input = type === 'select' ? $('<select>', { id }) : $('<input>', { id, type });
    $input.addClass(type === 'select' ? 'form-select' : 'form-control');
    options.forEach(([value, text]) => $input.append($('<option>', { value, text })));
    return $('<div>').addClass('col-12 col-lg-4').append(
      $('<label>', { for: id, text: label }).addClass('form-label fw-semibold'), $input);
  }
  const $controls = $('<div>').addClass('row g-3 mb-4').append(
    control('Search film titles', 'movie-search', 'search'),
    control('Youngest viewer’s age', 'movie-age', 'select', [['', 'Show all ratings'], ['0', 'Under 16'], ['16', '16–17'], ['18', '18 or older']]),
    control('Sort films', 'movie-sort', 'select', [['time', 'Session time'], ['title', 'Title A–Z']])
  );
  const $savedOnly = $('<button>', { type: 'button', text: 'Show saved films' }).addClass('btn btn-outline-secondary');
  const $reset = $('<button>', { type: 'button', text: 'Reset filters' }).addClass('btn btn-outline-secondary');
  const $count = $('<p>', { role: 'status' }).addClass('fw-semibold');
  const $status = $('<p>', { role: 'status' });
  $list.before($controls, $('<div>').addClass('d-flex flex-wrap gap-2 mb-3').append($savedOnly, $reset), $count, $status);

  function cardFor(film) {
    const $card = $('<article>', { id: `film-${film.id}` });
    // attr() connects the heading, addClass() applies the shared card style, toggleClass() marks saved cards.
    $card.attr('aria-labelledby', `title-${film.id}`).addClass('border p-3 p-md-4 bg-white rounded-4 shadow-sm')
      .toggleClass('is-selected', saved.includes(film.id));
    const $poster = $('<img>', { src: film.poster, alt: `${film.title} film poster` })
      .addClass('movie-poster img-fluid rounded-4 d-block mx-auto mx-md-0 shadow');
    const $posterCell = $('<div>').addClass('col-12 col-md-3 col-lg-3').append($poster);
    const $content = $('<div>').addClass('col-12 col-md-9 col-lg-9 d-flex flex-column align-self-stretch');
    const $title = $('<h3>', { id: `title-${film.id}`, text: film.title }).addClass('h2 mb-3');
    const $meta = $('<div>').addClass('d-flex flex-wrap gap-2 mb-3');
    [`${film.age}+`, film.language, film.format].forEach(value =>
      $meta.append($('<span>', { text: value }).addClass('border rounded-3 px-3 py-2 bg-light')));
    const $times = $('<div>').addClass('row g-2 mb-3');
    film.times.forEach(time => {
      const nextDay = time === '00:15';
      const session = `${film.id}-${time.replace(':', '')}`;
      const $link = $('<a>', { href: `schedule.html?session=${encodeURIComponent(session)}#booking` })
        .addClass('d-block h-100 bg-light border rounded-3 p-2 p-sm-3 text-decoration-none text-dark');
      $link.append($('<strong>', { text: time }).addClass('h5 d-block mb-1 text-success-emphasis'),
        $('<span>', { text: `From ₸${film.price.toLocaleString('en-US')}` }).addClass('d-block small text-body-secondary'));
      if (nextDay) $link.append($('<small>', { text: 'Next day' }).addClass('d-block text-success-emphasis'));
      $times.append($('<div>').addClass('col-6 col-xl-3').append($link));
    });
    const $save = $('<button>', { type: 'button', id: `save-${film.id}`, text: saved.includes(film.id) ? 'Remove from saved' : 'Save film' })
      .addClass('btn btn-outline-secondary movie-save py-2 px-3 mt-auto align-self-start')
      .attr({ 'data-film-id': film.id, 'aria-pressed': String(saved.includes(film.id)), 'aria-label': `${saved.includes(film.id) ? 'Remove from saved' : 'Save film'}: ${film.title}` });
    $content.append($title, $meta, $('<p>', { text: 'Choose a showtime for the demo ticket order.' }).addClass('mb-2'), $times, $save);
    $card.append($('<div>').addClass('row g-4 align-items-start').append($posterCell, $content));
    return $card;
  }

  function render(animate = false) {
    const matches = CinemaData.filterFilms($('#movie-search').val(), $('#movie-age').val(), savedOnly, saved, $('#movie-sort').val());
    $count.text(`${matches.length} of ${CinemaData.films.length} films shown. ${saved.length} saved.`);
    $savedOnly.attr('aria-pressed', String(savedOnly)).toggleClass('active', savedOnly)
      .text(savedOnly ? 'Show all films' : 'Show saved films');
    const replace = () => {
      $list.empty();
      if (!matches.length) $list.append($('<p>', { text: 'No matching films. Change the age filter or reset the filters.' }).addClass('p-3 border rounded'));
      matches.forEach(film => $list.append(cardFor(film)));
      if (animate) $list.fadeIn(180);
    };
    $list.stop(true, true);
    if (animate) $list.fadeOut(120, replace);
    else replace();
  }

  $('#movie-search').on('input', () => render(true));
  $('#movie-age, #movie-sort').on('change', () => render(true));
  $savedOnly.on('click', function () { savedOnly = !savedOnly; render(true); });
  $reset.on('click', function () {
    $('#movie-search').val(''); $('#movie-age').val(''); $('#movie-sort').val('time');
    savedOnly = false; render(true); $('#movie-search').trigger('focus');
  });
  // Delegation is needed because render() replaces film cards after every filter change.
  $list.on('click', '.movie-save', function () {
    const id = $(this).closest('article').attr('id').slice(5);
    saved = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
    const persisted = CinemaUI.writeStorage('dostar-shortlist', saved);
    render();
    $status.text(`${saved.length} films saved.${persisted ? '' : ' Storage unavailable; saves last until you leave this page.'}`);
    const $replacement = $(`#save-${id}`);
    ($replacement.length ? $replacement : $savedOnly).trigger('focus');
  });
  render();
});
