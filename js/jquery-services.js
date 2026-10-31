'use strict';

// jQuery 3.7.1 full build is loaded first; its effects module animates feedback below.
$(function () {
  // .val(), .siblings(), .text(), .append() and .on() replace value, sibling lookup, textContent, append() and addEventListener().
  // Traversal and card actions are shorter; validation rules remain explicit.
  const $form = $('#service-feedback-form');
  // Keep required/type attributes for native browser validation too.
  // Client-side checks never replace server-side validation in a real submission.
  const $name = $('#service-name');
  const $email = $('#service-email');
  const $topic = $('#service-topic');
  const $message = $('#service-message');
  const $submit = $('#service-feedback-submit');
  const $error = $('#service-feedback-error');
  const $result = $('#service-feedback-result');
  let reviews = [];
  let nextId = 1;
  let editing = null;

  const $phoneCell = $('<div>').addClass('col-12 col-md-6').append(
    $('<label>', { for: 'service-phone', text: 'Phone' }).addClass('form-label fw-semibold'),
    $('<input>', { id: 'service-phone', name: 'phone', type: 'tel', required: true, autocomplete: 'tel', placeholder: '+7 777 123 45 67' }).addClass('form-control'));
  $email.parent().after($phoneCell);
  const $phone = $('#service-phone');
  $topic.parent().addClass('col-md-6');
  $name.attr('maxlength', '80');
  $message.attr('maxlength', '500');
  const $consent = $('<input>', { id: 'service-consent', type: 'checkbox', required: true }).addClass('form-check-input me-2');
  const $consentLabel = $('<label>', { for: 'service-consent', text: 'Show my name and review below in this tab' }).addClass('form-check-label');
  const $consentCell = $('<div>').addClass('col-12 form-check').append($consent, $consentLabel);
  $submit.parent().before($consentCell);
  const $counter = $('<p>', { role: 'status' }).addClass('form-text fs-6');
  $message.after($counter);
  const $sort = $('<select>', { id: 'review-order' }).addClass('form-select').append(
    $('<option>', { value: 'new', text: 'Newest first' }), $('<option>', { value: 'old', text: 'Oldest first' }));
  const $sortCell = $('<div>').addClass('mt-3 mb-3').append(
    $('<label>', { for: 'review-order', text: 'Review order' }).addClass('form-label fw-semibold'), $sort);
  const $count = $('<p>', { role: 'status' });
  const $cards = $('<div>', { id: 'service-review-cards' }).addClass('d-grid gap-3');
  $result.after($('<h3>', { text: 'Reviews in this tab' }).addClass('h4 mt-4'), $sortCell, $count, $cards);
  $result.text('Reviews stay in this tab only. Contact details are not displayed or sent.').removeClass('is-hidden');
  $submit.text('Add local review');

  function fieldError($field, message) {
    // siblings() finds the message in the field's own wrapper; each input gets its own error.
    let $hint = $field.siblings('.field-error');
    if (!$hint.length) {
      $hint = $('<p>').addClass('field-error has-error mt-1 mb-0');
      $field.after($hint);
    }
    $hint.text(message).toggleClass('is-hidden', !message);
    $field.toggleClass('is-invalid', Boolean(message)).attr('aria-invalid', String(Boolean(message)));
    if ($field.hasClass('is-invalid')) $field.attr('aria-errormessage', `${$field.attr('id')}-error`);
    else $field.removeAttr('aria-errormessage');
    if ($field.attr('id')) {
      $hint.attr('id', `${$field.attr('id')}-error`);
      $field.attr('aria-describedby', $hint.attr('id'));
    }
  }

  function validationChecks() {
    const name = $name.val().trim();
    const email = $email.val().trim();
    const phone = $phone.val().trim();
    const message = $message.val().trim();
    const phoneDigits = phone.replace(/\D/g, '');
    return [
      [$name, name.length < 2 || name.length > 80 ? 'Enter 2–80 characters for your name.' : ''],
      [$email, !CinemaData.emailValid(email) || email.length > 120 ? 'Enter a valid email address.' : ''],
      [$phone, !/^\+?[\d\s()\-]+$/.test(phone) || phoneDigits.length < 10 || phoneDigits.length > 15 ? 'Enter a phone number with 10–15 digits.' : ''],
      [$topic, !$topic.val() ? 'Choose a topic.' : ''],
      [$message, message.length < 10 || message.length > 500 ? 'Write 10–500 characters.' : ''],
      [$consent, !$consent.prop('checked') ? 'Confirm that your review can appear in this tab.' : '']
    ];
  }

  function validate() {
    const checks = validationChecks();
    checks.forEach(([$field, message]) => fieldError($field, message));
    const first = checks.find(([, message]) => message);
    if (first) first[0].trigger('focus');
    return !first;
  }

  function render() {
    $cards.empty();
    const sorted = [...reviews].sort((a, b) => $sort.val() === 'old' ? a.id - b.id : b.id - a.id);
    $count.text(`${reviews.length} local reviews.`);
    if (!sorted.length) $cards.append($('<p>', { text: 'No reviews yet. Add the first one above.' }).addClass('p-3 border rounded'));
    sorted.forEach(review => {
      const $card = $('<article>').addClass('border rounded-4 p-3 bg-white text-break')
        .attr({ 'data-review-id': review.id, tabindex: '-1' });
      const $time = $('<time>', { text: new Date(review.created).toLocaleString() }).addClass('d-block mb-2')
        .attr('datetime', new Date(review.created).toISOString());
      const $actions = $('<div>').addClass('d-flex flex-wrap gap-2').append(
        $('<button>', { type: 'button', text: 'Edit review' }).addClass('btn btn-success review-edit'),
        $('<button>', { type: 'button', text: 'Delete review' }).addClass('btn btn-outline-secondary review-delete'));
      $card.append($('<h4>', { text: review.name }).addClass('h5'),
        $('<p>', { text: review.category }).addClass('fw-semibold'), $time,
        $('<p>', { text: review.message }), $actions);
      $cards.append($card);
    });
  }

  function clearFormState() {
    editing = null;
    $submit.text('Add local review');
    $form.find('[required], textarea').each(function () { fieldError($(this), ''); });
    $error.addClass('is-hidden');
    $counter.text('0/500 characters. Minimum 10 non-space characters.');
  }

  $submit.on('click', function (event) {
    if (!validate()) {
      event.preventDefault();
      $error.text('Review not saved. Check the highlighted fields.').removeClass('is-hidden');
    }
  });
  $form.on('submit', function (event) {
    // Without preventDefault the browser would navigate/reload and erase local reviews.
    event.preventDefault();
    if (!validate()) {
      $error.text('Review not saved. Check the highlighted fields.').removeClass('is-hidden');
      return;
    }
    const name = $name.val().trim();
    const message = $message.val().trim();
    const duplicate = reviews.some(item => item.id !== editing && item.name === name && item.message === message && item.topic === $topic.val());
    if (duplicate) {
      $error.text('This review is already listed. Edit the existing review instead.').removeClass('is-hidden');
      return;
    }
    const previous = reviews.find(item => item.id === editing);
    const review = { id: editing || nextId++, name, message, topic: $topic.val(), category: $topic.find('option:selected').text(), created: previous ? previous.created : Date.now() };
    if (editing) reviews = reviews.map(item => item.id === editing ? review : item);
    else reviews.push(review);
    $form.trigger('reset');
    clearFormState();
    render();
    // html() is used only for fixed trusted markup; visitor text is always inserted with text().
    $result.hide().html('<strong>Saved locally.</strong> Your review appears below; no message was sent to the cinema.')
      .slideDown(220, () => $cards.find('article:first').trigger('focus'));
  });
  $form.on('input change', 'input, select, textarea', function () {
    const current = validationChecks().find(([$field]) => $field[0] === this);
    if (current) fieldError(current[0], current[1]);
    $error.addClass('is-hidden');
    $counter.text(`${$message.val().length}/500 characters. Minimum 10 non-space characters.`);
  });
  $form.on('reset', function () { setTimeout(clearFormState, 0); });
  $sort.on('change', render);
  // These cards are created after the handler is bound, so direct binding to .review-edit would miss them.
  $cards.on('click', '.review-edit', function () {
    const id = Number($(this).closest('article').attr('data-review-id'));
    const review = reviews.find(item => item.id === id);
    editing = id;
    $name.val(review.name); $topic.val(review.topic); $message.val(review.message);
    // prop() reads or changes the live checkbox state; attr() represents its initial markup.
    $email.val(''); $phone.val(''); $consent.prop('checked', true);
    $submit.text('Save changes');
    $counter.text(`${review.message.length}/500 characters. Re-enter email and phone; they are not stored.`);
    $name.trigger('focus');
  });
  $cards.on('click', '.review-delete', function () {
    const $card = $(this).closest('article');
    const id = Number($card.attr('data-review-id'));
    $card.fadeOut(180, () => {
      reviews = reviews.filter(item => item.id !== id);
      if (editing === id) { $form[0].reset(); clearFormState(); }
      render();
      $result.text('Local review deleted.').removeClass('is-hidden');
    });
  });
  render();
  $counter.text('0/500 characters. Minimum 10 non-space characters.');
});
