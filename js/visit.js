'use strict';

(() => {
  const { element, field, button, section, status, validateFields, clearErrors } = CinemaUI;
  // Fix the accidental newline + trailing digit in the existing map URL at runtime.
  const map = document.querySelector('#location a[href^="https://2gis"]');
  map.setAttribute('href', map.getAttribute('href').split(/\s/)[0]);
  const panel = section('When should I leave?');
  panel.id = 'arrival-planner';
  panel.append(element('p', '', 'Enter a session you have confirmed with the cinema. We subtract your travel time and arrival buffer. This is a personal estimate, not a traffic forecast. Times use your device’s local clock.'));
  const form = element('form');
  form.noValidate = true;
  const date = field('Confirmed visit date', 'arrival-date', 'date');
  const time = field('Confirmed session time', 'arrival-time', 'time');
  const travel = field('Estimated travel time (minutes)', 'arrival-travel', 'number');
  const buffer = field('Arrive early by (minutes)', 'arrival-buffer', 'number');
  date.input.min = CinemaData.localDate();
  travel.input.min = '1';
  travel.input.max = '360';
  buffer.input.min = '0';
  buffer.input.max = '120';
  buffer.input.defaultValue = '20';
  const row = element('div', 'row');
  [date, time, travel, buffer].forEach(control => {
    control.input.required = true;
    control.wrapper.classList.add('col-12', 'col-md-6');
    row.append(control.wrapper);
  });
  const calculate = element('button', 'btn btn-success py-2 px-3', 'Calculate departure');
  calculate.type = 'submit';
  const reset = element('button', 'btn btn-outline-secondary py-2 px-3', 'Clear plan');
  reset.type = 'reset';
  const actions = element('div', 'd-flex flex-wrap gap-2');
  actions.append(calculate, reset);
  const output = element('p', 'status-area mt-3', 'Enter the four fields to plan your arrival.');
  output.id = 'arrival-result';
  output.setAttribute('role', 'status');
  form.append(row, actions, output);
  panel.append(form);
  document.querySelector('main').append(panel);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const start = new Date(`${date.input.value}T${time.input.value}:00`);
    const now = new Date();
    const departure = CinemaData.departureTime(date.input.value, time.input.value, travel.input.value, buffer.input.value, now);
    const valid = validateFields([
      [date.input, date.input.value === '' || date.input.value < CinemaData.localDate(now) ? 'Choose today or a future date.' : ''],
      [time.input, time.input.value === '' || Number.isNaN(start.getTime()) || start <= now ? 'Choose a session time in the future.' : ''],
      [travel.input, travel.input.value === '' || !Number.isInteger(Number(travel.input.value)) || Number(travel.input.value) < 1 || Number(travel.input.value) > 360 ? 'Enter a whole number from 1 to 360.' : ''],
      [buffer.input, buffer.input.value === '' || !Number.isInteger(Number(buffer.input.value)) || Number(buffer.input.value) < 0 || Number(buffer.input.value) > 120 ? 'Enter a whole number from 0 to 120.' : '']
    ]);
    if (!valid) { status(output, 'Check the highlighted fields.', true); return; }
    if (!departure) {
      status(output, 'There is not enough time left for travel and your arrival buffer. Choose a later session or check your estimates.', true);
      time.input.focus();
      return;
    }
    status(output, `Leave by ${departure.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}. This allows ${travel.input.value} minutes to travel and ${buffer.input.value} minutes before the session.`);
  });
  form.addEventListener('input', event => { CinemaUI.errorFor(event.target, ''); status(output, 'Details changed. Calculate again for an updated departure time.'); });
  form.addEventListener('reset', () => { clearErrors(form); status(output, 'Plan cleared. Enter your confirmed session details.'); });
})();
