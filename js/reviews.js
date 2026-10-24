'use strict';

// Shared review rendering and validation for Halls and Services.
function setupReviews(config) {
  const { element, button, field, renderList, status, validateFields, clearErrors } = CinemaUI;
  const byId = id => document.getElementById(id);
  const form = byId(config.form);
  form.noValidate = true;
  const name = byId(config.name);
  const message = byId(config.message);
  const topic = byId(config.topic);
  const email = config.email ? byId(config.email) : null;
  name.maxLength = 80;
  message.maxLength = 500;
  const submit = byId(config.submit);
  submit.type = 'submit';
  submit.textContent = 'Add local review';
  const result = byId(config.result);
  result.textContent = 'Reviews are stored only in this page’s memory. They are not published or sent and disappear on reload.';
  const counter = element('p', 'form-text fs-6');
  counter.id = `${config.form}-counter`;
  message.setAttribute('aria-describedby', counter.id);
  message.after(counter);
  const rating = config.rating ? byId(config.rating) : null;
  const consent = field('Display name (not your email) and review will appear below in this tab.', `${config.form}-consent`, 'checkbox');
  consent.input.classList.replace('form-control', 'form-check-input');
  consent.input.classList.add('ms-2');
  consent.input.required = true;
  submit.parentElement.before(consent.wrapper);
  const heading = element('h3', 'h4 mt-4', 'Reviews in this tab');
  const sorting = field('Review order', `${config.form}-sort`, 'select', [['new', 'Newest first'], ['old', 'Oldest first']]);
  const count = element('p');
  count.setAttribute('role', 'status');
  const cards = element('div', 'd-grid gap-3');
  cards.id = `${config.form}-cards`;
  result.after(heading, sorting.wrapper, count, cards);
  const error = byId(config.error);
  let reviews = [];
  let sequence = 0;
  let editing = null;
  function updateCounter() { counter.textContent = `${message.value.length}/500 characters. Minimum 10 non-padding characters.`; }

  function renderReview(review) {
    const card = element('article', 'border rounded p-3 bg-white text-break');
    card.append(element('h4', 'h5', review.name));
    card.append(element('p', 'fw-semibold', `${review.category}${review.rating ? ` · ${review.rating}/5` : ''}`));
    const time = element('time', 'd-block mb-2', new Date(review.created).toLocaleString());
    time.dateTime = new Date(review.created).toISOString();
    card.append(time, element('p', 'text-break', review.message));
    const actions = element('div', 'd-flex flex-wrap gap-2');
    actions.append(button('Edit review', () => {
      editing = review.id;
      name.value = review.name;
      message.value = review.message;
      topic.value = review.topic;
      if (rating) rating.value = review.rating;
      // The contact address is deliberately not stored in the review array.
      consent.input.checked = true;
      submit.textContent = 'Save changes';
      clearErrors(form);
      updateCounter();
      name.focus();
      status(result, `Editing this local review. Clear the form to cancel editing.${email ? ' Re-enter your email; it is not saved with reviews.' : ''}`);
    }), button('Delete review', () => {
      reviews = reviews.filter(item => item.id !== review.id);
      if (editing === review.id) form.reset();
      render();
      status(result, 'Local review deleted.');
      (cards.querySelector('button') || name).focus();
    }, true));
    card.append(actions);
    return card;
  }

  function render() {
    const sorted = [...reviews].sort((a, b) => sorting.input.value === 'old' ? a.id - b.id : b.id - a.id);
    const average = rating && reviews.length > 0 ? ` Average: ${(reviews.reduce((sum, item) => sum + Number(item.rating), 0) / reviews.length).toFixed(1)}/5.` : '';
    count.textContent = `${reviews.length} local reviews.${average}`;
    renderList(cards, sorted, renderReview, 'No reviews yet. Add the first local review using the form above.');
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const trimmedName = name.value.trim();
    const trimmedMessage = message.value.trim();
    const pairs = [[name, trimmedName.length < 2 || trimmedName.length > 80 ? 'Enter 2–80 characters for your name.' : '']];
    if (email) pairs.push([email, !CinemaData.emailValid(email.value) || email.value.trim().length > 120 ? 'Enter a valid email address.' : '']);
    if (rating) pairs.push([rating, !['1', '2', '3', '4', '5'].includes(rating.value) ? 'Choose a rating from 1 to 5.' : '']);
    pairs.push([topic, topic.value === '' ? 'Choose a category.' : '']);
    pairs.push([message, trimmedMessage.length < 10 || trimmedMessage.length > 500 ? 'Write a review between 10 and 500 characters.' : '']);
    pairs.push([consent.input, !consent.input.checked ? 'Confirm that the review may appear locally below.' : '']);
    if (!validateFields(pairs)) { status(error, 'Review not saved. Check the highlighted fields.', true); return; }
    const duplicate = reviews.some(review => review.id !== editing && review.name === trimmedName && review.message === trimmedMessage && review.topic === topic.value);
    if (duplicate) { status(error, 'This review is already in the list. Edit the existing review instead.', true); return; }
    const previous = reviews.find(review => review.id === editing);
    const review = {
      id: editing ?? ++sequence, name: trimmedName, message: trimmedMessage,
      topic: topic.value, category: topic.selectedOptions[0].textContent,
      rating: rating ? rating.value : '', created: previous ? previous.created : Date.now()
    };
    if (editing !== null) reviews = reviews.map(item => item.id === editing ? review : item);
    else reviews.push(review);
    form.reset();
    render();
    status(result, 'Review saved in this tab only. Nothing was sent to the cinema. You can edit or delete it below.');
  });
  form.addEventListener('input', event => {
    CinemaUI.errorFor(event.target, '');
    error.classList.add('is-hidden');
    updateCounter();
  });
  form.addEventListener('reset', () => {
    editing = null;
    submit.textContent = 'Add local review';
    clearErrors(form);
    error.classList.add('is-hidden');
    status(result, 'Form cleared. Saved local reviews remain below.');
    // Do not erase saved review cards when clearing the form.
    setTimeout(updateCounter, 0);
  });
  sorting.input.addEventListener('change', render);
  updateCounter();
  render();
}
