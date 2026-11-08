'use strict';

// jQuery 3.7.1 applies the stored reading preference consistently on every page.
const CinemaReading = {
  apply(large) {
    $('html').toggleClass('fs-4', large);
  },
};

$(function () {
  let large = CinemaUI.readStorage('dostar-large-text', false) === true;
  const $button = $('<button>', {
    type: 'button',
    id: 'reading-size-toggle',
  }).addClass(
    'btn btn-outline-secondary btn-sm py-2 px-2 ms-2 me-auto me-xxl-4 flex-shrink-0',
  );
  const $fullLabel = $('<span>').addClass('d-none d-sm-inline');
  const $compactLabel = $('<span>')
    .addClass('d-sm-none')
    .attr('aria-hidden', 'true');
  $button.append($fullLabel, $compactLabel);
  $('header .navbar-brand').after($button);
  const $nav = $('header .navbar')
    .removeClass('navbar-expand-lg')
    .addClass('navbar-expand-xl');

  function applyReading() {
    CinemaReading.apply(large);
    $nav
      .toggleClass('navbar-expand-xl', !large)
      .toggleClass('navbar-expand-xxl', large);
    $button
      .attr('aria-pressed', String(large))
      .attr(
        'aria-label',
        large ? 'Use standard text size' : 'Use larger text size',
      );
    $fullLabel.text(large ? 'Standard text size' : 'Larger text size');
    $compactLabel.text(large ? 'A−' : 'A+');
  }

  $button.on('click', function () {
    large = !large;
    CinemaUI.writeStorage('dostar-large-text', large);
    applyReading();
  });

  applyReading();
});
