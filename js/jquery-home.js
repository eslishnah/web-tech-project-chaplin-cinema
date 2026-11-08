'use strict';

// jQuery 3.7.1 full build supplies the effects used below; defer loads it before this file.
$(function () {
  // $('<...>'), .append() and .on() replace createElement(), append() and addEventListener().
  // This version is shorter because generated controls share one event binding.
  const $tools = $('<section>').addClass('container bg-white rounded-4 shadow-sm p-3 mt-3');
  const $toggle = $('<button>', { type: 'button', text: 'Reading settings & find a page' })
    .addClass('btn btn-link text-dark fw-semibold text-decoration-none p-0')
    .attr({ 'aria-expanded': 'false', 'aria-controls': 'home-tools-panel' });
  const $panel = $('<div>', { id: 'home-tools-panel' }).hide();
  const $large = $('<button>', { type: 'button' }).addClass('btn btn-outline-secondary mt-3');
  const $readingStatus = $('<p>', { role: 'status' }).addClass('mt-2 mb-0');
  const $search = $('<input>', { id: 'site-search', type: 'search', name: 'site-search' }).addClass('form-control');
  const $category = $('<select>', { id: 'site-category', name: 'site-category' }).addClass('form-select');
  [['', 'All pages'], ['Tickets', 'Tickets'], ['Information', 'Information'], ['Feedback', 'Feedback']]
    .forEach(([value, label]) => $category.append($('<option>', { value, text: label })));
  const $row = $('<div>').addClass('row mt-3');
  const $searchCell = $('<div>').addClass('col-12 col-md-8 mb-3')
    .append($('<label>', { for: 'site-search', text: 'Find a page by task' }).addClass('form-label fw-semibold'), $search);
  const $categoryCell = $('<div>').addClass('col-12 col-md-4 mb-3')
    .append($('<label>', { for: 'site-category', text: 'Page category' }).addClass('form-label fw-semibold'), $category);
  $row.append($searchCell, $categoryCell);
  const $count = $('<p>', { role: 'status' });
  const $results = $('<ul>').addClass('list-group my-3');
  const $reset = $('<button>', { type: 'button', text: 'Reset page search' }).addClass('btn btn-outline-secondary');
  $panel.append($large, $readingStatus, $row, $count, $results, $reset);
  $tools.append($toggle, $panel);
  $('body > header').after($tools);

  let large = CinemaUI.readStorage('dostar-large-text', false) === true;
  function applyReading() {
    CinemaReading.apply(large);
    $large.attr('aria-pressed', String(large))
      .toggleClass('active', large).text(large ? 'Use standard text' : 'Use larger text');
  }

  function searchPages() {
    const query = $search.val().trim().toLowerCase();
    const category = $category.val();
    const matches = CinemaData.pages.filter(page =>
      `${page.title} ${page.description}`.toLowerCase().includes(query) && (!category || page.category === category));
    $count.text(`${matches.length} of ${CinemaData.pages.length} pages found.`);
    $results.empty();
    if (!matches.length) $results.append($('<li>', { text: 'No matching pages. Try “tickets” or reset the search.' }).addClass('list-group-item'));
    matches.forEach(page => {
      const $link = $('<a>', { href: page.href, text: page.title }).addClass('d-block py-2 fw-semibold text-success-emphasis');
      $results.append($('<li>').addClass('list-group-item').append($link, $('<span>', { text: page.description })));
    });
  }

  $toggle.on('click', function () {
    $panel.stop(true, true).slideToggle(220, () => $(this).attr('aria-expanded', String($panel.is(':visible'))));
  });
  $large.on('click', function () {
    large = !large;
    const saved = CinemaUI.writeStorage('dostar-large-text', large);
    applyReading();
    $readingStatus.text(`${large ? 'Larger' : 'Standard'} text enabled.${saved ? ' Preference saved on this device.' : ' Preference applies to this page.'}`);
  });
  $panel.on('input change', '#site-search, #site-category', searchPages);
  $reset.on('click', function () {
    $search.val('');
    $category.val('');
    searchPages();
    $search.trigger('focus');
  });
  $tools.on('keydown', function (event) {
    if (event.key === 'Escape' && $panel.is(':visible')) {
      $panel.slideUp(180, () => $toggle.attr('aria-expanded', 'false').trigger('focus'));
    }
  });
  applyReading();
  searchPages();
});
