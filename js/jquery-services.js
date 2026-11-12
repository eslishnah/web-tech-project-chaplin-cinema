'use strict';

$(function () {
  const $feedback = $('#feedback');
  const $form = $('#service-feedback-form').prop('noValidate', true);
  const $name = $('#service-name').prop('readOnly', true);
  const $message = $('#service-message').attr({ rows: 3, maxlength: 500 });
  const $submit = $('#service-feedback-submit');
  const $cancel = $('#service-feedback-reset').attr('type', 'button').text('Cancel');
  const $ratingError = $('<p>', { id: 'review-rating-error' }).addClass('small has-error mt-1 mb-0 is-hidden');
  const $rating = $('<fieldset>').addClass('col-12').append(
    $('<legend>', { text: 'Your rating' }).addClass('form-label fs-6 fw-semibold float-none w-auto')
  );
  const $stars = $('<div>').addClass('d-flex flex-wrap gap-1');
  const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });
  let reviews = [];
  let editing = null;
  let nextId = 1;

  for (let value = 1; value <= 5; value++) {
    const id = `service-rating-${value}`;
    $stars.append(
      $('<input>', {
        id, type: 'radio', name: 'service-rating', value, required: true,
        'aria-label': `${value} out of 5 stars`,
        'aria-describedby': 'review-rating-error'
      }).addClass('btn-check'),
      $('<label>', { for: id, 'aria-hidden': 'true' }).addClass('btn p-2 fs-2 lh-1 text-nowrap')
    );
  }
  const $ratingInputs = $stars.find('input');
  $rating.append($stars, $ratingError);

  const $heading = $feedback.children('h2').attr('id', 'write-review');
  const $signIn = $('<button>', { type: 'button', text: 'Sign in to write a review' }).addClass('btn btn-success');
  const $composer = $('<section>', { 'aria-labelledby': 'write-review' }).addClass('pe-lg-3')
    .append($heading, $signIn, $form);

  $form.find('#service-email, #service-topic').parent().remove();
  $feedback.children('#service-feedback-error, #service-feedback-result').remove();
  $name.parent().removeClass('col-md-6').after($rating);
  $message.prev('label').text('Your review');

  const $average = $('<div>').addClass('d-flex align-items-center flex-wrap gap-3');
  const $count = $('<p>').addClass('small text-body-secondary mb-0');
  const $summary = $('<div>', { role: 'status' }).addClass('bg-success-subtle rounded-3 px-3 py-2')
    .append($average, $count);
  const $sort = $('<select>', { id: 'review-order' }).addClass('form-select form-select-sm').append(
    $('<option>', { value: 'new', text: 'Newest first' }),
    $('<option>', { value: 'old', text: 'Oldest first' })
  );
  const $sortGroup = $('<div>').addClass('align-self-start').append(
    $('<label>', { for: 'review-order', text: 'Sort reviews' }).addClass('visually-hidden'),
    $sort
  );
  const $listHeading = $('<h2>', { id: 'visitor-reviews', text: 'Visitor reviews', tabindex: -1 }).addClass('h3 mb-0');
  const $cards = $('<div>', { id: 'service-review-cards' }).addClass('d-grid gap-3');
  const $list = $('<section>', { 'aria-labelledby': 'visitor-reviews' }).addClass('d-grid gap-3').append(
    $('<div>').addClass('d-flex flex-wrap align-items-center justify-content-between gap-2').append($listHeading, $sortGroup),
    $summary,
    $cards
  );
  $feedback.append(
    $('<div>').addClass('row g-4 align-items-start').append(
      $('<div>').addClass('col-12 col-lg-5').append($composer),
      $('<div>').addClass('col-12 col-lg-7').append($list)
    )
  );

  function selectedRating() {
    return Number($ratingInputs.filter(':checked').val() || 0);
  }

  function updateRating() {
    const rating = selectedRating();
    $ratingInputs.each(function () {
      const filled = Number(this.value) <= rating;
      $(this).next('label').text(filled ? '★' : '☆')
        .toggleClass('text-warning', filled)
        .toggleClass('text-body-secondary', !filled);
    });
  }

  function setRatingError(message) {
    $ratingError.text(message).toggleClass('is-hidden', !message);
    $ratingInputs.attr('aria-invalid', String(Boolean(message)));
  }

  function setFormReview(review = null) {
    editing = review;
    $form[0].reset();
    $name.val(CinemaProfile.get()?.name || '');
    $heading.text(review ? 'Edit your review' : 'Write a review');
    $submit.text(review ? 'Save changes' : 'Post review');
    $cancel.toggleClass('is-hidden', !review);
    if (review) {
      $message.val(review.message);
      $ratingInputs.filter(`[value="${review.rating}"]`).prop('checked', true);
    }
    CinemaUI.errorFor($message[0], '');
    setRatingError('');
    updateRating();
  }

  function starDisplay(rating) {
    const filled = Math.round(rating);
    return $('<span>', { 'aria-hidden': 'true', text: '★'.repeat(filled) + '☆'.repeat(5 - filled) })
      .addClass('text-warning fs-5 text-nowrap');
  }

  function renderReviews() {
    const profile = CinemaProfile.get();
    $average.empty();
    $count.text(`${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`);
    if (reviews.length) {
      const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      $average.append($('<span>', { text: `${average.toFixed(1)} / 5` }).addClass('fs-4 fw-semibold'), starDisplay(average));
    }
    $sortGroup.toggleClass('is-hidden', reviews.length < 2);
    $cards.empty();
    if (!reviews.length) {
      $cards.append($('<p>', { text: 'No reviews yet.' }).addClass('border rounded-3 p-3 mb-0 text-body-secondary'));
      return;
    }

    const sorted = [...reviews].sort((a, b) => $sort.val() === 'old' ? a.id - b.id : b.id - a.id);
    sorted.forEach(review => {
      const $card = $('<article>', { tabindex: -1, 'data-review-id': review.id })
        .addClass('border rounded-4 p-3 p-md-4 text-break');
      const $time = $('<time>', { datetime: review.created.toISOString(), text: dateFormat.format(review.created) })
        .addClass('small text-body-secondary');
      const $cardHeading = $('<div>').addClass('d-flex flex-wrap justify-content-between align-items-baseline gap-1').append(
        $('<h3>', { text: review.name }).addClass('h5 mb-0'),
        $time
      );
      const $score = $('<p>').addClass('mb-2 d-flex align-items-center gap-2').append(
        starDisplay(review.rating),
        $('<span>', { text: `${review.rating} / 5` }).addClass('small text-body-secondary')
      );
      $card.append($cardHeading, $score, $('<p>', { text: review.message }).addClass('mb-0'));
      if (review.owner === profile) {
        $card.append($('<div>').addClass('d-flex flex-wrap gap-2 mt-3').append(
          $('<button>', { type: 'button', text: 'Edit review' }).addClass('btn btn-outline-secondary btn-sm review-edit'),
          $('<button>', { type: 'button', text: 'Delete review' }).addClass('btn btn-outline-secondary btn-sm review-delete')
        ));
      }
      $cards.append($card);
    });
  }

  function syncProfile() {
    const profile = CinemaProfile.get();
    const moveFocus = profile && document.activeElement === $signIn[0];
    setFormReview();
    $form.toggleClass('is-hidden', !profile);
    $signIn.toggleClass('is-hidden', Boolean(profile));
    renderReviews();
    if (moveFocus) $ratingInputs.first().trigger('focus');
  }

  $signIn.on('click', () => CinemaProfile.open());
  $(document).on('cinema-profile-change', syncProfile);
  $form.on('change', 'input[name="service-rating"]', function () {
    updateRating();
    setRatingError('');
  });
  $message.on('input', function () {
    const length = $message.val().trim().length;
    if ($message.attr('aria-invalid') === 'true' && length >= 10 && length <= 500) {
      CinemaUI.errorFor(this, '');
    }
  });
  $cancel.on('click', function () {
    setFormReview();
    $ratingInputs.first().trigger('focus');
  });
  $form.on('submit', function (event) {
    event.preventDefault();
    const profile = CinemaProfile.get();
    if (!profile) return;

    const rating = selectedRating();
    const message = $message.val().trim();
    const duplicate = reviews.some(review => review !== editing && review.owner === profile &&
      review.rating === rating && review.message === message);
    const messageError = message.length < 10 || message.length > 500 ? 'Write between 10 and 500 characters.'
      : duplicate ? 'You have already posted this review.' : '';
    setRatingError(rating ? '' : 'Choose a rating from 1 to 5 stars.');
    CinemaUI.errorFor($message[0], messageError);
    if (!rating || messageError) {
      (rating ? $message : $ratingInputs.first()).trigger('focus');
      return;
    }

    const review = editing || { id: nextId++, name: profile.name, owner: profile, created: new Date() };
    Object.assign(review, { rating, message });
    if (!editing) reviews.push(review);
    setFormReview();
    renderReviews();
    $cards.find(`[data-review-id="${review.id}"]`).trigger('focus');
  });
  $sort.on('change', renderReviews);
  $cards.on('click', '.review-edit, .review-delete', function () {
    const $card = $(this).closest('article');
    const id = Number($card.attr('data-review-id'));
    const review = reviews.find(item => item.id === id && item.owner === CinemaProfile.get());
    if (!review) return;

    if ($(this).hasClass('review-delete')) {
      reviews = reviews.filter(item => item !== review);
      if (editing === review) setFormReview();
      $card.find('button').prop('disabled', true);
      $card.fadeOut(180, () => {
        renderReviews();
        $listHeading.trigger('focus');
      });
      return;
    }

    setFormReview(review);
    $ratingInputs.filter(':checked').trigger('focus');
  });

  syncProfile();
});
