'use strict';

// jQuery uses append() in place of DOM insertion and on() in place of individual card listeners.
$(function () {
  const $list = $('#movie-list');
  const stored = CinemaUI.readStorage('dostar-shortlist', []);
  let saved = Array.isArray(stored) ? stored.filter(id => CinemaData.films.some(film => film.id === id)) : [];
  let savedOnly = false;

  function control(label, id, options) {
    const $input = options
      ? $('<select>', { id }).addClass('form-select')
      : $('<input>', { id, type: 'search' }).addClass('form-control');
    if (options) options.forEach(([value, text]) => $input.append($('<option>', { value, text })));
    return $('<div>').addClass('col-12 col-sm-6 col-xl-3').append(
      $('<label>', { for: id, text: label }).addClass('form-label fw-semibold'), $input);
  }

  const categories = [...new Set(CinemaData.films.map(film => film.category))].sort();
  const categoryOptions = [['', 'All categories'], ...categories.map(category => [category, category])];
  const ages = [['', 'All ages'], ...[6, 14, 16, 18, 21].map(age => [String(age), `Up to ${age}+`])];
  const $filters = $('<div>').addClass('row g-2 mb-3').append(
    control('Search films', 'movie-search'),
    control('Category', 'movie-category', categoryOptions),
    control('Age rating', 'movie-age', ages),
    control('Sort by', 'movie-sort', [['catalogue', 'Catalogue order'], ['title', 'Title A–Z']])
  );
  const $shortlist = $('<button>', { type: 'button', text: 'Show saved films' }).addClass('btn btn-outline-secondary');
  const $reset = $('<button>', { type: 'button', text: 'Reset filters' }).addClass('btn btn-outline-secondary');
  const $actions = $('<div>').addClass('d-flex flex-wrap gap-2 mb-3').append($shortlist, $reset);
  const $count = $('<p>', { role: 'status' }).addClass('fw-semibold');
  const $notice = $('#movie-error');
  $('#now-showing > h2').text('Now showing');
  $('#now-showing > p').first().remove();
  $list.removeClass('d-grid gap-4').addClass('row g-3').before($filters, $actions, $count);

  function cardFor(film) {
    const isSaved = saved.includes(film.id);
    const $poster = $('<img>', { src: film.poster, alt: '', loading: 'lazy', width: 240, height: 336 })
      .addClass('img-fluid w-100 rounded-top-3');
    const $text = $('<div>').addClass('p-2 p-sm-3').append(
      $('<span>', { text: film.title }).addClass('fw-semibold d-block'),
      $('<span>', { text: `${film.category} · ${film.age}+` }).addClass('small text-body-secondary d-block'),
      $('<span>', { text: `From ${CinemaData.money(CinemaData.fromPrice(film))}` }).addClass('small d-block mt-2')
    );
    const $open = $('<button>', { type: 'button', 'aria-label': `Details: ${film.title}` }).addClass('film-open btn p-0 text-start w-100')
      .append($poster, $text);
    const $save = $('<button>', { type: 'button', text: isSaved ? 'Saved' : 'Save' })
      .addClass('movie-save btn btn-link text-success-emphasis small px-2 px-sm-3 py-1')
      .attr({ 'aria-pressed': String(isSaved), 'aria-label': `${isSaved ? 'Remove from saved' : 'Save film'}: ${film.title}` });
    // The chain sets the card layout, marks saved films, then attaches the card controls.
    const $card = $('<article>', { 'data-film-id': film.id }).addClass('border rounded-3 h-100 d-flex flex-column justify-content-between')
      .toggleClass('is-selected', isSaved)
      .append($open, $('<div>').addClass('border-top').append($save));
    return $('<div>').addClass('col-6 col-md-4 col-lg-3 col-xl-2').append($card);
  }

  function render(animate = false) {
    const matches = CinemaData.filterFilms({
      query: $('#movie-search').val(), category: $('#movie-category').val(), age: $('#movie-age').val(),
      sort: $('#movie-sort').val(), savedOnly, saved
    });
    $count.text(`${matches.length} of ${CinemaData.films.length} films · ${saved.length} saved`);
    $shortlist.attr('aria-pressed', String(savedOnly)).toggleClass('active', savedOnly)
      .text(savedOnly ? 'Show all films' : 'Show saved films');
    $list.stop(true, true).empty();
    if (!matches.length) $list.append($('<p>', { text: 'No matching films. Change the filters to try again.' }));
    matches.forEach(film => $list.append(cardFor(film)));
    if (animate) $list.hide().fadeIn(160);
  }

  async function openFilm(id) {
    const film = CinemaData.films.find(item => item.id === id);
    if (!film) return;
    try {
      const booking = await import('./booking.js');
      $notice.addClass('is-hidden');
      booking.openFilm(film);
    } catch {
      $notice.text('Film details could not load. Open the site through Live Server and try again.').removeClass('is-hidden');
    }
  }

  $filters.on('input', '#movie-search', () => render(true));
  $filters.on('change', 'select', () => render(true));
  $shortlist.on('click', () => { savedOnly = !savedOnly; render(true); });
  $reset.on('click', () => {
    $('#movie-search, #movie-category, #movie-age').val('');
    $('#movie-sort').val('catalogue');
    savedOnly = false;
    render();
    $('#movie-search').trigger('focus');
  });
  $list.on('click', '.film-open', function () {
    openFilm($(this).closest('article').attr('data-film-id'));
  });
  $list.on('click', '.movie-save', function () {
    const id = $(this).closest('article').attr('data-film-id');
    saved = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
    const stored = CinemaUI.writeStorage('dostar-shortlist', saved);
    $notice.text(stored ? '' : 'Your shortlist is available until you leave this page.').toggleClass('is-hidden', stored);
    render();
    const $replacement = $list.find(`[data-film-id="${id}"] .movie-save`);
    ($replacement.length ? $replacement : $shortlist).trigger('focus');
  });

  render();
  openFilm(new URLSearchParams(location.search).get('film'));
});
