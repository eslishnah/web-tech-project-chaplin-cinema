'use strict';

(() => {
  const { element, link } = CinemaUI;
  const location = document.getElementById('location');
  const heading = location.querySelector('h2');
  const address = location.querySelector('.lead');
  const phone = location.querySelector('a[href^="tel:"]').closest('p');

  function externalLink(label, href) {
    const action = link(label, href);
    action.target = '_blank';
    action.rel = 'noopener noreferrer';
    return action;
  }

  heading.textContent = 'Location';
  heading.classList.add('mb-3');
  address.textContent = '12A Nurgisa Tlendiyev Avenue, Koktal Shopping Centre, 3rd floor';
  address.classList.add('fs-6', 'mb-3');
  const city = element('span', 'd-inline-block border rounded-pill px-3 py-2 mb-3', 'Astana');

  const map = element('iframe', 'd-block w-100 border rounded-4 bg-body-tertiary');
  map.title = 'Interactive map of Dostar Cinema in Astana';
  map.src = 'https://yandex.kz/map-widget/v1/?ol=biz&oid=154645933634&ll=71.378875%2C51.181198&z=17';
  map.height = '360';
  map.loading = 'lazy';

  const directions = externalLink('Open in 2GIS', 'https://2gis.kz/astana/firm/70000001090472672');
  directions.classList.replace('btn-success', 'btn-outline-success');
  directions.classList.add('mt-3');

  const venue = element('div', 'col-12 col-lg-8');
  venue.append(heading, city, address, map, directions);

  const hours = element('section');
  const schedule = element('dl', 'd-flex align-items-center justify-content-between flex-wrap gap-2 mb-0');
  schedule.append(
    element('dt', 'fw-normal text-success-emphasis', 'Daily'),
    element('dd', 'mb-0 px-2 py-1 rounded-2 bg-success-subtle text-success-emphasis text-nowrap fw-semibold', '10:00–00:00')
  );
  hours.append(element('h3', 'h3 mb-3', 'Opening hours'), schedule);

  const contacts = element('section');
  const social = element('div', 'd-flex flex-wrap gap-2');
  const whatsapp = externalLink('WhatsApp', 'https://api.whatsapp.com/message/5ACZ7HYLVPCNL1?autoload=1&app_absent=0&utm_source=ig');
  const instagram = externalLink('Instagram', 'https://www.instagram.com/dostar.cinema');
  whatsapp.classList.replace('btn-success', 'btn-outline-success');
  instagram.classList.replace('btn-success', 'btn-outline-secondary');
  phone.classList.add('mb-3');
  social.append(whatsapp, instagram);
  contacts.append(element('h3', 'h3 mb-3', 'Contacts'), phone, social);

  const details = element('div', 'col-12 col-lg-4 d-flex flex-column justify-content-between gap-4');
  details.append(hours, contacts);
  const layout = element('div', 'row g-4 g-xl-5');
  layout.append(venue, details);
  location.replaceChildren(layout);

  const gallery = document.getElementById('route');
  gallery.setAttribute('aria-label', 'Photos of the route to the cinema');
  gallery.tabIndex = -1;
  gallery.querySelectorAll('h2, ol, figcaption').forEach(node => node.remove());
  gallery.querySelectorAll('img').forEach(image => image.classList.add('rounded-3'));
})();
