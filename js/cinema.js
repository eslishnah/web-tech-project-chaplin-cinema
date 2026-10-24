'use strict';

(() => {
  const { element, field, button, link, section, renderList } = CinemaUI;
  const panel = section('Prepare for your visit');
  panel.id = 'visit-checklist';
  panel.append(element('p', '', 'Choose what matters to you, then mark the steps you have completed. These are preparation tips, not guarantees about cinema facilities. This checklist resets when you leave the page.'));
  const audience = field('Who are you planning for?', 'visitor-needs', 'select', [['everyone', 'General visit'], ['family', 'A family with children'], ['assistance', 'A visitor who may need assistance']]);
  const progress = element('p', 'fw-semibold');
  progress.setAttribute('role', 'status');
  const checklist = element('div');
  const common = [
    { id: 'film', text: 'Check the film’s age rating and language.', href: 'movies.html', action: 'Find a film' },
    { id: 'real', text: 'Call the cinema to confirm the real session, price and availability.', href: 'tel:+77474330558', action: 'Call the cinema' },
    { id: 'route', text: 'Plan your route and allow time to arrive.', href: 'visit.html', action: 'Plan arrival' }
  ];
  const extra = {
    everyone: [],
    family: [{ id: 'ages', text: 'Check that the selected film is suitable for the youngest child.', href: 'movies.html', action: 'Check age ratings' }],
    assistance: [{ id: 'access', text: 'Ask the cinema about step-free access, seating and any assistance you need.', href: 'tel:+77474330558', action: 'Ask about access' }]
  };
  const completed = new Set();
  function tasks() { return [...common, ...extra[audience.input.value]]; }
  function updateProgress() {
    const items = tasks();
    const count = items.filter(item => completed.has(item.id)).length;
    progress.textContent = `${count} of ${items.length} steps complete.${count === items.length ? ' Preparation checklist complete. Have a good visit!' : ''}`;
    progress.classList.toggle('is-success', count === items.length);
  }
  function render() {
    renderList(checklist, tasks(), item => {
      const row = element('div', 'border rounded p-3 mb-3');
      const label = element('label', 'd-block mb-2');
      const checkbox = element('input', 'form-check-input me-2');
      checkbox.type = 'checkbox';
      checkbox.checked = completed.has(item.id);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) completed.add(item.id);
        else completed.delete(item.id);
        row.classList.toggle('is-selected', checkbox.checked);
        updateProgress();
      });
      row.classList.toggle('is-selected', checkbox.checked);
      label.append(checkbox, document.createTextNode(item.text));
      row.append(label, link(item.action, item.href));
      return row;
    }, 'No steps.');
    updateProgress();
  }
  panel.append(audience.wrapper, progress, checklist, button('Reset checklist', () => { completed.clear(); render(); audience.input.focus(); }, true));
  audience.input.addEventListener('change', render);
  document.querySelector('main').append(panel);
  render();
})();
