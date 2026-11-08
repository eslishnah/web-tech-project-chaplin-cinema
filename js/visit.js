'use strict';

(() => {
  const directions = document.querySelector('#location a[href^="https://2gis"]');
  directions.href = '#route';
  directions.textContent = 'See arrival directions';
  directions.removeAttribute('target');
  directions.removeAttribute('rel');

  const gallery = document.getElementById('route');
  gallery.setAttribute('aria-label', 'Photos of the route to the cinema');
  gallery.tabIndex = -1;
  gallery.querySelectorAll('h2, ol, figcaption').forEach(node => node.remove());
  gallery.querySelectorAll('img').forEach(image => image.classList.add('rounded-3'));
})();
