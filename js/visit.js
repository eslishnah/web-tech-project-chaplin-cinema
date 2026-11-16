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
  address.textContent = 'Astana, 12A Nurgisa Tlendiyev Avenue, Koktal Shopping Centre, 3rd floor';
  address.classList.add('fs-6', 'mb-3');

  const map = element('iframe', 'd-block w-100 border rounded-4 bg-body-tertiary');
  map.title = 'Interactive map of Dostar Cinema in Astana';
  map.src = 'https://yandex.kz/map-widget/v1/?ol=biz&oid=154645933634&ll=71.378875%2C51.181198&z=17';
  map.height = '360';
  map.loading = 'lazy';

  const directions = externalLink('Open in 2GIS', 'https://2gis.kz/astana/firm/70000001090472672');
  directions.classList.replace('btn-success', 'btn-outline-success');
  directions.classList.add('mt-3');

  const venue = element('div', 'col-12 col-lg-8');
  venue.append(heading, address, map, directions);

  const panelClasses = 'bg-body rounded-4 shadow-sm p-3';
  const hours = element('section', panelClasses);
  const schedule = element('dl', 'd-flex align-items-center flex-wrap gap-2 mb-0');
  schedule.append(
    element('dt', 'fw-normal text-success-emphasis', 'Daily'),
    element('dd', 'mb-0 px-2 py-1 rounded-2 bg-success-subtle text-success-emphasis text-nowrap fw-semibold', '10:00–00:00')
  );
  hours.append(element('h3', 'h3 mb-3', 'Opening hours'), schedule);

  const contacts = element('section', panelClasses);
  const social = element('div', 'd-flex flex-wrap gap-2');
  const whatsapp = externalLink('WhatsApp', 'https://api.whatsapp.com/message/5ACZ7HYLVPCNL1?autoload=1&app_absent=0&utm_source=ig');
  const instagram = externalLink('Instagram', 'https://www.instagram.com/dostar.cinema');
  whatsapp.classList.replace('btn-success', 'btn-outline-success');
  instagram.classList.replace('btn-success', 'btn-outline-success');
  phone.classList.add('mb-3');
  social.append(whatsapp, instagram);
  contacts.append(element('h3', 'h3 mb-3', 'Contacts'), phone, social);

  const details = element('div', 'col-12 col-lg-4 d-flex flex-column gap-3');
  details.append(hours, contacts);
  const layout = element('div', 'row g-4 g-xl-5');
  layout.append(venue, details);

  const faqItems = [
    ['Where is Dostar Cinema located?', 'Dostar Cinema is located on the 3rd floor of Koktal Shopping Centre, 12A Nurgisa Tlendiyev Avenue, Astana.'],
    ['Can I buy tickets online?', 'Yes, you can browse movies, choose a showtime, select your seats, and book tickets directly on our website.'],
    ['Can I buy tickets at the cinema?', 'Yes, tickets can be purchased at the cinema’s ticket counter.'],
    ['Is the cinema accessible to people with reduced mobility?', 'Yes, the cinema welcomes guests with reduced mobility. Please contact us in advance to arrange any assistance you may need.'],
    ['Is parking available?', 'Parking is available at Koktal Shopping Centre. Please check with the shopping centre for details.'],
    ['Can I bring my own food and drinks?', 'No, outside food and drinks are not permitted.']
  ];
  const faq = element('section', location.className);
  const locationStyle = getComputedStyle(location);
  faq.style.borderTop = locationStyle.borderTop;
  faq.style.borderRadius = locationStyle.borderRadius;
  faq.append(element('h2', 'h3 text-dark mb-3', 'Frequently Asked Questions'));
  const accordion = element('div', 'accordion');
  accordion.id = 'visit-faq';
  faqItems.forEach(([question, answer], index) => {
    const answerId = `visit-faq-answer-${index + 1}`;
    const item = element('div', 'accordion-item');
    const itemHeading = element('h3', 'accordion-header');
    const toggle = element('button', 'accordion-button collapsed fw-bold', question);
    toggle.style.fontFamily = 'var(--bs-font-sans-serif)';
    toggle.type = 'button';
    toggle.dataset.bsToggle = 'collapse';
    toggle.dataset.bsTarget = `#${answerId}`;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', answerId);
    itemHeading.append(toggle);
    const panel = element('div', 'accordion-collapse collapse');
    panel.id = answerId;
    panel.dataset.bsParent = '#visit-faq';
    panel.addEventListener('show.bs.collapse', () => {
      toggle.style.backgroundColor = 'var(--bs-body-bg)';
      toggle.style.color = 'var(--bs-body-color)';
      toggle.style.boxShadow = 'none';
    });
    panel.addEventListener('hide.bs.collapse', () => {
      toggle.style.removeProperty('background-color');
      toggle.style.removeProperty('color');
      toggle.style.removeProperty('box-shadow');
    });
    panel.setAttribute('aria-labelledby', `${answerId}-heading`);
    itemHeading.id = `${answerId}-heading`;
    const content = element('div', 'accordion-body', answer);
    panel.append(content);
    item.append(itemHeading, panel);
    accordion.append(item);
  });
  faq.append(accordion);
  location.replaceChildren(layout);
  location.after(faq);

  document.getElementById('route')?.remove();
})();
