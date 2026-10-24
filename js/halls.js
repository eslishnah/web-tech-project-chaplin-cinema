'use strict';

(() => {
  const category = CinemaUI.field('Review category', 'hall-category', 'select', [['', 'Choose a category'], ['comfort', 'Comfort'], ['sound', 'Sound'], ['cleanliness', 'Cleanliness'], ['access', 'Access and assistance']]);
  document.getElementById('hall-comment').parentElement.before(category.wrapper);
  const hallCell = document.querySelector('#halls tbody tr:last-child td');
  hallCell.textContent = 'Contact the cinema to confirm. This demo does not assign halls or seats.';
  setupReviews({ form: 'hall-feedback-form', name: 'hall-name', message: 'hall-comment', topic: 'hall-category', rating: 'hall-rating', submit: 'hall-feedback-submit', result: 'hall-feedback-result', error: 'hall-feedback-error' });
})();
