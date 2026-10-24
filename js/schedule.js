'use strict';

(() => {
  const { element, button, field, renderList, status, validateFields, clearErrors } = CinemaUI;
  const { findFilm, money, localDate, lastDemoDate, sessionErrors, cartTotal, ticketCount } = CinemaData;
  const byId = id => document.getElementById(id);
  const form = byId('booking-form');
  form.noValidate = true;
  const fields = {
    name: byId('booking-name'), email: byId('booking-email'), session: byId('booking-session'),
    date: byId('booking-date'), quantity: byId('booking-tickets'), note: byId('booking-note'), agree: byId('booking-agree')
  };
  renderList(byId('session-list'), CinemaData.films, film => {
    const row = element('tr');
    row.append(element('td', '', film.title), element('td', '', film.time), element('td', '', money(film.price)));
    return row;
  }, 'No session examples available.');
  const placeholder = element('option', '', 'Choose a session');
  placeholder.value = '';
  fields.session.replaceChildren(placeholder);
  CinemaData.films.forEach(film => {
    const option = element('option', '', `${film.title} — ${film.time} (${film.age}+)`);
    option.value = film.session;
    fields.session.append(option);
  });
  const age = field('Youngest visitor’s age', 'booking-age', 'number');
  age.wrapper.classList.add('col-12', 'col-md-6');
  age.input.min = '0';
  age.input.max = '120';
  age.input.required = true;
  fields.quantity.parentElement.after(age.wrapper);
  fields.age = age.input;
  fields.name.maxLength = 80;
  fields.email.maxLength = 120;
  fields.date.min = localDate();
  fields.date.max = lastDemoDate();
  byId('booking-availability').textContent = 'Demo only: today through the next 30 days. One session per date, up to 10 tickets. Times use your device’s local clock; no availability is verified.';
  const notice = element('p', 'alert alert-success', '1. Choose a session and seats. 2. Review your basket. 3. Confirm the demo. Estimated price: KZT 1,000 per ticket. No payment, email or reservation is made. Details stay in this tab and disappear on reload.');
  notice.id = 'checkout-notice';
  form.before(notice);
  const error = byId('booking-error');
  const summary = byId('order-summary');
  summary.querySelector('p.small').textContent = 'Estimated demo totals only. The seat map is illustrative: the cinema has not confirmed this hall, its layout, prices or seat availability.';
  byId('order-summary-title').textContent = 'Ticket selection and order basket';
  const cartContainer = element('div', 'my-3');
  cartContainer.id = 'ticket-cart';
  const cartStatus = element('p', 'fw-semibold');
  cartStatus.id = 'cart-status';
  cartStatus.setAttribute('role', 'status');
  const reviewStatus = element('p');
  reviewStatus.id = 'review-status';
  reviewStatus.setAttribute('role', 'status');
  const customerSummary = element('p', 'text-break');
  const confirm = byId('booking-submit');
  confirm.textContent = 'Confirm demo order';
  const review = button('Review order', reviewOrder);
  review.id = 'cart-review';
  confirm.before(review);
  const clearCart = button('Clear ticket basket', () => {
    cart = [];
    invalidate();
    renderCart();
    status(error, 'Ticket basket cleared. Your contact details have not been erased.');
    fields.session.focus();
  }, true);
  clearCart.id = 'cart-clear';
  confirm.parentElement.append(clearCart);
  confirm.parentElement.before(cartContainer, cartStatus, customerSummary, reviewStatus);
  byId('booking-review').type = 'submit';
  byId('booking-review').textContent = 'Choose seats';
  byId('booking-reset').textContent = 'Clear form';
  byId('booking-result-title').textContent = 'Last demo confirmation';
  let cart = [];
  let reviewed = false;

  // This is a schematic practice map, not the cinema's real hall or live seat inventory.
  const seatIds = Array.from({ length: 12 }, (_, row) =>
    Array.from({ length: 12 }, (_, number) => `${row + 1}-${number + 1}`)
  ).flat();
  const seatDialog = element('div', 'modal fade');
  seatDialog.id = 'seat-picker';
  seatDialog.tabIndex = -1;
  seatDialog.setAttribute('aria-labelledby', 'seat-picker-title');
  seatDialog.setAttribute('aria-describedby', 'seat-picker-description');
  const dialogShell = element('div', 'modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl');
  const dialogContent = element('div', 'modal-content rounded-4 bg-dark text-white border-0');
  const dialogHeader = element('div', 'modal-header border-secondary align-items-start');
  const filmHeader = element('div', 'd-flex align-items-start gap-3 flex-grow-1');
  const filmPoster = element('img', 'rounded-3 shadow-sm d-none d-sm-block');
  filmPoster.width = 72;
  filmPoster.height = 108;
  const filmDetails = element('div');
  filmDetails.append(element('p', 'small text-warning fw-bold text-uppercase mb-1', 'Seat selection · Dostar Cinema'));
  const dialogTitle = element('h2', 'modal-title fs-5 fw-bold', 'Choose seats');
  dialogTitle.id = 'seat-picker-title';
  const sessionDetails = element('p', 'mb-1');
  const sessionMeta = element('p', 'small text-white-50 mb-0');
  filmDetails.append(dialogTitle, sessionDetails, sessionMeta);
  filmHeader.append(filmPoster, filmDetails);
  const closeSeatDialog = element('button', 'btn-close btn-close-white ms-2 flex-shrink-0');
  closeSeatDialog.type = 'button';
  closeSeatDialog.setAttribute('aria-label', 'Close seat map without saving');
  closeSeatDialog.setAttribute('data-bs-dismiss', 'modal');
  dialogHeader.append(filmHeader, closeSeatDialog);
  const dialogBody = element('div', 'modal-body');
  const seatDescription = element('p', 'text-white mb-4', 'Select the same number of seats as tickets. Tap a selected seat again to remove it.');
  seatDescription.id = 'seat-picker-description';
  const seatHint = element('p', 'small text-warning d-lg-none mb-0', 'Swipe the seat map sideways to see every seat.');
  const mobileScreenLabel = element('p', 'small text-center text-white-50 d-lg-none mb-0', 'SCREEN');
  const seatMap = element('div', 'overflow-auto pb-2');
  seatMap.id = 'seat-map';
  seatMap.setAttribute('role', 'group');
  seatMap.setAttribute('aria-label', 'Illustrative seat map with 12 rows and 12 seats per row');
  const seatLegend = element('div', 'd-flex flex-wrap gap-3 align-items-center small');
  const availableKey = element('span', 'd-inline-flex align-items-center gap-2');
  availableKey.append(element('span', 'badge border border-light rounded-2 px-2 py-2', '1'), document.createTextNode('Available in demo'));
  const selectedKey = element('span', 'd-inline-flex align-items-center gap-2');
  selectedKey.append(element('span', 'badge bg-warning text-black rounded-2 px-2 py-2', '1'), document.createTextNode('Selected'));
  seatLegend.append(availableKey, selectedKey);
  const seatStatus = element('p', 'fw-semibold mb-0');
  seatStatus.id = 'seat-selection-status';
  seatStatus.setAttribute('role', 'status');
  seatStatus.setAttribute('aria-live', 'polite');
  const mapDisclaimer = element('p', 'small text-white-50 mb-0', 'Illustrative layout only. The real hall and seat availability are unknown; choosing a seat here does not reserve it.');
  dialogBody.append(seatDescription, mobileScreenLabel, seatMap, mapDisclaimer);
  const dialogFooter = element('div', 'modal-footer border-secondary');
  const footerInfo = element('div', 'me-auto');
  footerInfo.append(seatLegend, seatStatus, seatHint);
  const cancelSeats = button('Cancel', () => seatModal.hide(), true);
  cancelSeats.classList.replace('btn-outline-secondary', 'btn-outline-light');
  const saveSeats = button('Add selected seats', commitSeats);
  saveSeats.id = 'seat-save';
  saveSeats.disabled = true;
  dialogFooter.append(footerInfo, cancelSeats, saveSeats);
  dialogContent.append(dialogHeader, dialogBody, dialogFooter);
  dialogShell.append(dialogContent);
  seatDialog.append(dialogShell);
  document.body.append(seatDialog);
  const seatModal = bootstrap.Modal.getOrCreateInstance(seatDialog);
  let pending = null;
  let selectedSeats = new Set();
  let returnFocus = fields.session;
  let seatsSaved = false;

  function drawSeats() {
    seatMap.replaceChildren();
    const layout = element('div', 'd-table mx-auto');
    const screen = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    screen.setAttribute('viewBox', '0 0 800 90');
    screen.setAttribute('role', 'img');
    screen.setAttribute('aria-label', 'Screen at the front of the hall');
    screen.classList.add('w-100', 'mb-3');
    const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arc.setAttribute('d', 'M 30 65 C 190 5 610 5 770 65');
    arc.setAttribute('fill', 'none');
    arc.setAttribute('stroke', 'white');
    arc.setAttribute('stroke-width', '5');
    arc.setAttribute('stroke-linecap', 'round');
    const screenText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    screenText.setAttribute('x', '400');
    screenText.setAttribute('y', '66');
    screenText.setAttribute('text-anchor', 'middle');
    screenText.setAttribute('fill', 'white');
    screenText.textContent = 'SCREEN';
    screen.append(arc, screenText);
    layout.append(screen);
    for (let row = 1; row <= 12; row += 1) {
      const line = element('div', 'd-flex flex-nowrap align-items-center gap-1 mb-2');
      line.append(element('strong', 'font-monospace text-white-50 me-2 flex-shrink-0', String(row).padStart(2, '\u00a0')));
      for (let number = 1; number <= 12; number += 1) {
        const seat = `${row}-${number}`;
        const isSelected = selectedSeats.has(seat);
        const seatButton = button(String(number), () => {
          if (selectedSeats.has(seat)) selectedSeats.delete(seat);
          else if (selectedSeats.size < pending.target) selectedSeats.add(seat);
          else {
            seatStatus.textContent = `You already selected ${pending.target} seats. Remove one to choose a different seat.`;
            return;
          }
          drawSeats();
          byId(`seat-${seat}`).focus();
        }, !isSelected);
        seatButton.id = `seat-${seat}`;
        if ([3, 7, 11].includes(number)) seatButton.classList.add('ms-3');
        seatButton.classList.replace(isSelected ? 'btn-success' : 'btn-outline-secondary', isSelected ? 'btn-warning' : 'btn-outline-light');
        seatButton.classList.add('rounded-3', 'flex-shrink-0');
        if (isSelected) seatButton.classList.add('text-black');
        seatButton.setAttribute('aria-label', `Row ${row}, seat ${number}${isSelected ? ', selected' : ''}`);
        seatButton.setAttribute('aria-pressed', String(isSelected));
        line.append(seatButton);
      }
      line.append(element('strong', 'font-monospace text-white-50 ms-2 flex-shrink-0', String(row).padStart(2, '\u00a0')));
      layout.append(line);
    }
    seatMap.append(layout);
    const ordered = seatIds.filter(seat => selectedSeats.has(seat));
    seatStatus.textContent = `${selectedSeats.size} of ${pending.target} seats selected.${ordered.length ? ` Selected: ${ordered.join(', ')}.` : ''}`;
    saveSeats.disabled = selectedSeats.size !== pending.target;
    saveSeats.textContent = pending.existing ? 'Save selected seats' : 'Add selected seats';
  }

  function openSeatPicker(chosen, existing, target, trigger) {
    pending = { chosen, existing, target };
    selectedSeats = new Set(existing?.seats || []);
    returnFocus = trigger || document.activeElement;
    seatsSaved = false;
    const film = findFilm(chosen.session);
    dialogTitle.textContent = film.title;
    filmPoster.src = film.poster;
    filmPoster.alt = `${film.title} film poster`;
    const readableDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${chosen.date}T12:00:00`));
    sessionDetails.textContent = `${readableDate} · ${film.time} · ${film.age}+`;
    sessionMeta.textContent = `${target} ${target === 1 ? 'ticket' : 'tickets'} · ${money(film.price)} each (demo estimate)`;
    drawSeats();
    seatModal.show();
  }

  function commitSeats() {
    if (!pending || selectedSeats.size !== pending.target) return;
    const seats = seatIds.filter(seat => selectedSeats.has(seat));
    if (pending.existing) {
      pending.existing.seats = seats;
      pending.existing.quantity = seats.length;
    } else {
      cart.push({ key: `${pending.chosen.session}-${pending.chosen.date}`, session: pending.chosen.session, date: pending.chosen.date, quantity: seats.length, seats });
    }
    seatsSaved = true;
    invalidate();
    renderCart();
    status(error, `Seats ${seats.join(', ')} added to your demo basket. Review your order below.`);
    seatModal.hide();
  }

  seatDialog.addEventListener('shown.bs.modal', () => seatMap.querySelector('button')?.focus());
  seatDialog.addEventListener('hidden.bs.modal', () => {
    if (seatsSaved) {
      cartStatus.tabIndex = -1;
      cartStatus.focus();
    } else if (returnFocus?.isConnected) returnFocus.focus();
    else fields.session.focus();
    pending = null;
  });

  function selection() {
    return { session: fields.session.value, date: fields.date.value, quantity: fields.quantity.value, age: fields.age.value };
  }

  function invalidate() {
    reviewed = false;
    confirm.disabled = true;
    customerSummary.textContent = '';
    reviewStatus.textContent = cart.length === 0 ? 'Add tickets to begin.' : 'Review the basket and your details before confirming.';
  }

  function liveSelection() {
    const chosen = selection();
    const film = findFilm(chosen.session);
    const quantity = Number(chosen.quantity);
    byId('order-session').textContent = film ? `${film.title} — ${film.time} (${film.age}+)` : 'No session selected';
    byId('order-date').textContent = chosen.date || 'No date selected';
    byId('order-quantity').textContent = Number.isInteger(quantity) && quantity > 0 && quantity <= 10 ? String(quantity) : 'Enter 1–10 tickets';
    byId('order-unit-price').textContent = film ? `${money(film.price)} (demo estimate)` : 'Choose a session';
    byId('order-total').textContent = film && Number.isInteger(quantity) && quantity > 0 && quantity <= 10 ? `${money(film.price * quantity)} selection estimate — add to basket below` : 'Choose a session and quantity';
  }

  function renderCart() {
    renderList(cartContainer, cart, item => {
      const film = findFilm(item.session);
      const row = element('article', 'border rounded p-3 mb-2');
      row.append(element('h4', 'h6', `${film.title} — ${film.time}`), element('p', '', `${item.date} · ${item.quantity} × ${money(film.price)} = ${money(item.quantity * film.price)}`), element('p', 'fw-semibold', `Selected seats: ${item.seats.join(', ')}`));
      const controls = element('div', 'd-flex flex-wrap gap-2');
      const minus = button('− 1 ticket', () => {
        item.seats = item.seats.slice(0, -1);
        item.quantity = item.seats.length;
        invalidate();
        renderCart();
        status(error, `One ticket removed. Remaining seats: ${item.seats.join(', ')}.`);
        (byId(`cart-minus-${item.key}`).disabled ? byId(`cart-remove-${item.key}`) : byId(`cart-minus-${item.key}`)).focus();
      }, true);
      minus.id = `cart-minus-${item.key}`;
      minus.disabled = item.quantity <= 1;
      minus.setAttribute('aria-label', `Remove one ticket: ${film.title}, ${item.date}`);
      const plus = button('+ 1 ticket', event => openSeatPicker(item, item, item.quantity + 1, event.currentTarget));
      plus.id = `cart-plus-${item.key}`;
      plus.disabled = item.quantity >= 10;
      plus.setAttribute('aria-label', `Add one ticket: ${film.title}, ${item.date}`);
      const edit = button('Change seats', event => openSeatPicker(item, item, item.quantity, event.currentTarget), true);
      edit.setAttribute('aria-label', `Change seats: ${film.title}, ${item.date}`);
      const remove = button('Remove session', () => {
        cart = cart.filter(entry => entry.key !== item.key);
        invalidate();
        renderCart();
        (cartContainer.querySelector('button:not(:disabled)') || fields.session).focus();
      }, true);
      remove.id = `cart-remove-${item.key}`;
      remove.setAttribute('aria-label', `Remove session: ${film.title}, ${item.date}`);
      controls.append(plus, minus, edit, remove);
      row.append(controls);
      return row;
    }, 'Your ticket basket is empty. Choose a session and add tickets.');
    cartStatus.textContent = `${ticketCount(cart)} tickets · ${cart.length} sessions · Estimated basket total: ${money(cartTotal(cart))}`;
    clearCart.disabled = cart.length === 0;
    review.disabled = cart.length === 0;
    confirm.disabled = !reviewed || cart.length === 0;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const chosen = selection();
    const errors = sessionErrors(chosen);
    const existing = cart.find(item => item.session === chosen.session && item.date === chosen.date);
    if (existing && existing.quantity + Number(chosen.quantity) > 10) errors.quantity = 'The basket already has tickets for this session. Maximum 10 in total.';
    if (cart.some(item => item.date === chosen.date && item.session !== chosen.session)) errors.date = 'This demo allows one session per date. Remove the other session or choose another date.';
    if (!validateFields(['session', 'date', 'quantity', 'age'].map(key => [fields[key], errors[key]]))) {
      status(error, 'Tickets were not added. Check the highlighted fields.', true);
      return;
    }
    openSeatPicker(chosen, existing, (existing?.quantity || 0) + Number(chosen.quantity), byId('booking-review'));
  });

  function validateOrder() {
    const errors = [];
    const name = fields.name.value.trim();
    errors.push([fields.name, name.length < 2 || name.length > 80 ? 'Enter a name between 2 and 80 characters.' : '']);
    errors.push([fields.email, !CinemaData.emailValid(fields.email.value) || fields.email.value.trim().length > 120 ? 'Enter a valid email address, such as name@example.com.' : '']);
    errors.push([fields.note, fields.note.value.trim().length > 500 ? 'Use no more than 500 characters.' : '']);
    errors.push([fields.agree, !fields.agree.checked ? 'Confirm that you understand this is a demo.' : '']);
    const ageErrors = cart.map(item => sessionErrors({ ...item, age: fields.age.value }));
    errors.push([fields.age, ageErrors.find(item => item.age)?.age || '']);
    const fieldsValid = validateFields(errors);
    const expired = ageErrors.some(item => item.date || item.session || item.quantity);
    const missingSeats = cart.some(item => !Array.isArray(item.seats) || item.seats.length !== item.quantity);
    if (!fieldsValid || expired || missingSeats || cart.length === 0) {
      status(error, expired ? 'A basket session is no longer valid. Remove it and choose another date.' : 'Complete the highlighted details and add tickets before reviewing.', true);
      return false;
    }
    return true;
  }

  function reviewOrder() {
    if (!validateOrder()) return;
    reviewed = true;
    confirm.disabled = false;
    customerSummary.textContent = `Buyer: ${fields.name.value.trim()} · Email: ${fields.email.value.trim()} · Youngest visitor: ${fields.age.value}. Notes: ${fields.note.value.trim() || 'None'}.`;
    reviewStatus.textContent = `Reviewed: ${ticketCount(cart)} tickets (${cart.map(item => item.seats.join(', ')).join('; ')}), estimated ${money(cartTotal(cart))}. Confirm below to finish the demo.`;
    status(error, 'Order reviewed. Check your basket and details before confirming.');
    confirm.focus();
  }

  confirm.addEventListener('click', () => {
    if (!reviewed || !validateOrder()) { invalidate(); return; }
    byId('ticket-reference').textContent = CinemaData.demoReference();
    byId('ticket-session').textContent = cart.map(item => `${findFilm(item.session).title}, ${item.date} ${findFilm(item.session).time}, seats ${item.seats.join(', ')}`).join('; ');
    byId('ticket-quantity').textContent = String(ticketCount(cart));
    byId('ticket-total').textContent = `${money(cartTotal(cart))} (demo estimate)`;
    status(byId('booking-status'), 'Demo complete. No payment was taken, no email was sent and no seats were reserved. Save this summary only as a practice example.');
    byId('booking-result').classList.add('is-success');
    byId('booking-result').tabIndex = -1;
    byId('booking-result').focus();
    cart = [];
    invalidate();
    renderCart();
    status(error, 'Demo finished. Add new tickets to start another order.');
  });

  form.addEventListener('input', event => {
    if (event.target.id) CinemaUI.errorFor(event.target, '');
    if ([fields.session, fields.date, fields.age, fields.quantity].includes(event.target)) {
      ['session', 'date', 'age', 'quantity'].forEach(key => CinemaUI.errorFor(fields[key], ''));
    }
    error.classList.add('is-hidden');
    invalidate();
    liveSelection();
  });
  form.addEventListener('change', () => { invalidate(); liveSelection(); });
  form.addEventListener('reset', () => {
    // Native form values reset after the reset event has finished.
    setTimeout(() => {
      clearErrors(form);
      invalidate();
      liveSelection();
      status(error, 'Form cleared. The ticket basket is unchanged; use Clear ticket basket to remove tickets.');
      fields.name.focus();
    }, 0);
  });
  byId('booking-edit').addEventListener('click', () => { invalidate(); fields.name.focus(); });
  const requested = new URLSearchParams(location.search).get('session');
  if (findFilm(requested)) fields.session.value = requested;
  liveSelection();
  invalidate();
  renderCart();
})();
