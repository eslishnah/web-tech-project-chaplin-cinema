'use strict';

(() => {
  const {
    element,
    button,
    field,
    renderList,
    status,
    validateFields,
  } = CinemaUI;
  const {
    findFilm,
    money,
    localDate,
    lastDemoDate,
    sessionErrors,
    cartTotal,
    ticketCount,
  } = CinemaData;
  const byId = (id) => document.getElementById(id);
  const isBookingPage = location.pathname.endsWith('/booking.html');
  const form = byId('booking-form');
  const fields = {
    name: byId('booking-name'),
    email: byId('booking-email'),
    session: byId('booking-session'),
    date: byId('booking-date'),
    quantity: byId('booking-tickets'),
    agree: byId('booking-agree'),
  };
  const selectedFilm = new URLSearchParams(location.search).get('film');
  const listedSessions = CinemaData.showtimes.filter(
    (session) => !selectedFilm || session.id === selectedFilm,
  );
  if (!isBookingPage) {
    const schedule = byId('live-schedule');
    schedule.querySelector('.table-responsive').remove();
    byId('start-checkout').remove();
    byId('booking').remove();
    const visibleFilms = CinemaData.films.filter(
      (film) => !selectedFilm || film.id === selectedFilm,
    );
    schedule.querySelector('h2').textContent = 'Choose a session';
    schedule.querySelector('p.lead').textContent =
      'Choose a session below, then choose seats on the Booking page.';
    const count = element(
      'p',
      'text-body-secondary mb-4',
      `${visibleFilms.length} ${visibleFilms.length === 1 ? 'film' : 'films'} · ${listedSessions.length} ${listedSessions.length === 1 ? 'session' : 'sessions'} · Prices shown per ticket`,
    );
    schedule.append(count);
    if (selectedFilm) {
      const allFilms = element('a', 'btn btn-outline-secondary mb-4', 'View all films');
      allFilms.href = 'schedule.html#live-schedule';
      schedule.append(allFilms);
    }
    const wrapper = element('div', 'table-responsive border rounded-3');
    const table = element('table', 'table table-hover align-middle mb-0');
    table.id = 'schedule-table';
    const caption = element(
      'caption',
      'caption-top small px-3',
      'Session examples by film. Confirm current times and prices with the cinema.',
    );
    const head = element('thead', 'table-success');
    const headingRow = element('tr');
    ['Time', 'Price from', 'Select'].forEach(
      (label) => {
        const heading = element('th', 'py-3', label);
        heading.scope = 'col';
        headingRow.append(heading);
      },
    );
    head.append(headingRow);
    const body = element('tbody');
    visibleFilms.forEach((film) => {
      const groupRow = element('tr', 'table-success');
      const groupCell = element('th', 'py-3', '');
      groupCell.scope = 'rowgroup';
      groupCell.colSpan = 3;
      const filmHeading = element('div', 'd-flex align-items-center gap-3');
      const poster = element('img', 'rounded-2 shadow-sm flex-shrink-0');
      poster.src = film.poster;
      poster.alt = '';
      poster.width = 48;
      poster.height = 72;
      poster.loading = 'lazy';
      const details = element('div');
      details.append(
        element('span', 'd-block fs-5 fw-semibold text-dark', film.title),
        element(
          'span',
          'd-block small text-body-secondary fw-normal',
          `${film.originalTitle} · ${film.age}+ · ${film.language} · ${film.format}`,
        ),
      );
      filmHeading.append(poster, details);
      groupCell.append(filmHeading);
      groupRow.append(groupCell);
      body.append(groupRow);
      listedSessions
        .filter((session) => session.id === film.id)
        .forEach((session) => {
          const row = element('tr');
          const time = element('th', 'ps-3', '');
          time.scope = 'row';
          time.append(element('span', 'fs-5 text-success-emphasis', session.time));
          if (session.nextDay)
            time.append(
              element('small', 'd-block fw-normal text-warning-emphasis', 'After midnight · next day'),
            );
          const price = element('td', 'fw-semibold text-nowrap', money(session.price));
          const actionCell = element('td');
          const action = element('a', 'btn btn-success btn-sm text-nowrap', 'Choose seats');
          action.href = `booking.html?session=${encodeURIComponent(session.session)}#booking`;
          action.setAttribute(
            'aria-label', `${film.title}, ${session.time}, from ${money(session.price)}. Choose seats`,
          );
          actionCell.append(action);
          row.append(time, price, actionCell);
          body.append(row);
        });
    });
    if (!visibleFilms.length) {
      const row = element('tr');
      const message = element(
        'td', 'p-3',
        'No sessions match this film. Return to Movies to choose another film.',
      );
      message.colSpan = 3;
      row.append(message);
      body.append(row);
    }
    table.append(caption, head, body);
    wrapper.append(table);
    schedule.append(wrapper);
    return;
  }
  byId('live-schedule').remove();
  byId('booking-note').parentElement.remove();
  form.noValidate = true;
  const placeholder = element('option', '', 'Choose a session');
  placeholder.value = '';
  fields.session.replaceChildren(placeholder);
  CinemaData.showtimes.forEach((film) => {
    const option = element(
      'option',
      '',
      `${film.title} — ${film.time}${film.nextDay ? ' (after midnight)' : ''} · ${film.language} (${film.age}+)`,
    );
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
  const phone = field('Phone number', 'booking-phone', 'tel');
  phone.wrapper.classList.add('col-12', 'col-md-6');
  phone.input.autocomplete = 'tel';
  phone.input.inputMode = 'tel';
  phone.input.maxLength = 30;
  phone.input.required = true;
  fields.email.parentElement.after(phone.wrapper);
  fields.phone = phone.input;
  fields.name.maxLength = 80;
  fields.email.maxLength = 120;
  fields.date.min = localDate();
  fields.date.max = lastDemoDate();
  byId('booking-availability').textContent =
    'Choose a date within the next 30 days. Up to 10 tickets per session. The 00:15 showing belongs to the following calendar day. Availability must be confirmed with the cinema.';
  const notice = element(
    'p',
    'alert alert-success',
    '1. Choose a session and seats. 2. Review order. 3. Prepare order. Prices are estimates. This site does not take payment or reserve seats; confirm your plans with the cinema.',
  );
  notice.id = 'checkout-notice';
  form.before(notice);
  const error = byId('booking-error');
  const summary = byId('order-summary');
  summary.querySelector('p.small').textContent =
    'Estimated totals. The seat map is illustrative; the cinema has not confirmed this hall, its layout, prices or seat availability.';
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
  confirm.textContent = 'Prepare order';
  const review = button('Review order', reviewOrder);
  review.id = 'cart-review';
  confirm.before(review);
  const clearCart = button(
    'Clear ticket basket',
    () => {
      cart = [];
      invalidate();
      renderCart();
      status(
        error,
        'Ticket basket cleared. Your contact details have not been erased.',
      );
      fields.session.focus();
    },
    true,
  );
  clearCart.id = 'cart-clear';
  confirm.parentElement.append(clearCart);
  confirm.parentElement.before(
    cartContainer,
    cartStatus,
    customerSummary,
    reviewStatus,
  );
  byId('booking-review').type = 'submit';
  byId('booking-review').textContent = 'Choose seats';
  byId('booking-reset').remove();
  byId('booking-edit').remove();
  byId('booking-result-title').textContent = 'Your order summary';
  byId('booking-result').querySelector('dt').textContent = 'Local reference';
  byId('ticket-reference').textContent = 'Created after review';
  byId('ticket-session').textContent = 'Choose a session';
  byId('ticket-quantity').textContent = 'Choose seats';
  byId('ticket-total').textContent = 'Calculated after review';
  byId('booking-agree').nextElementSibling.textContent =
    'I have checked the age rating and understand that this site does not reserve seats or take payment.';
  byId('booking-status').textContent =
    'Complete the form and choose seats to prepare your order.';
  const result = byId('booking-result');
  result.classList.add('is-hidden');
  let cart = [];
  let reviewed = false;
  let lastDemoSummary = '';
  const copySummary = button(
    'Copy order summary',
    async () => {
      if (!lastDemoSummary) return;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(lastDemoSummary);
        } else {
          const fallback = element('textarea', 'visually-hidden');
          fallback.value = lastDemoSummary;
          document.body.append(fallback);
          fallback.select();
          if (!document.execCommand('copy')) throw new Error('Copy failed');
          fallback.remove();
        }
        status(byId('booking-status'), 'Order summary copied to the clipboard.');
      } catch (_error) {
        status(
          byId('booking-status'),
          'The browser could not copy the summary. Select the confirmation text and copy it manually.',
          true,
        );
      }
    },
    true,
  );
  copySummary.id = 'copy-demo-summary';
  copySummary.disabled = true;
  copySummary.classList.add('mt-3');
  result.append(copySummary);

  function updateActions() {
    const hasTickets = cart.length > 0;
    review.classList.toggle('is-hidden', !hasTickets || reviewed);
    clearCart.classList.toggle('is-hidden', !hasTickets);
    confirm.classList.toggle('is-hidden', !hasTickets || !reviewed);
    confirm.disabled = !hasTickets || !reviewed;
    copySummary.disabled = !lastDemoSummary;
  }

  // This is a schematic practice map, not the cinema's real hall or live seat inventory.
  const seatIds = Array.from({ length: 12 }, (_, row) =>
    Array.from({ length: 12 }, (_, number) => `${row + 1}-${number + 1}`),
  ).flat();
  const seatDialog = element('div', 'modal fade');
  seatDialog.id = 'seat-picker';
  seatDialog.tabIndex = -1;
  seatDialog.setAttribute('aria-labelledby', 'seat-picker-title');
  seatDialog.setAttribute('aria-describedby', 'seat-picker-description');
  const dialogShell = element(
    'div',
    'modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl',
  );
  const dialogContent = element(
    'div',
    'modal-content rounded-4 bg-dark text-white border-0',
  );
  const dialogHeader = element(
    'div',
    'modal-header border-secondary align-items-start',
  );
  const filmHeader = element(
    'div',
    'd-flex align-items-start gap-3 flex-grow-1',
  );
  const filmPoster = element('img', 'rounded-3 shadow-sm d-none d-sm-block');
  filmPoster.width = 72;
  filmPoster.height = 108;
  const filmDetails = element('div');
  filmDetails.append(
    element(
      'p',
      'small text-warning fw-bold text-uppercase mb-1 d-none d-sm-block',
      'Seat selection · Dostar Cinema',
    ),
  );
  const dialogTitle = element('h2', 'modal-title fs-5 fw-bold', 'Choose seats');
  dialogTitle.id = 'seat-picker-title';
  const sessionDetails = element('p', 'mb-1');
  const sessionMeta = element('p', 'small text-white-50 mb-0 d-none d-sm-block');
  filmDetails.append(dialogTitle, sessionDetails, sessionMeta);
  filmHeader.append(filmPoster, filmDetails);
  const closeSeatDialog = element(
    'button',
    'btn-close btn-close-white ms-2 flex-shrink-0',
  );
  closeSeatDialog.type = 'button';
  closeSeatDialog.setAttribute('aria-label', 'Close seat map without saving');
  closeSeatDialog.setAttribute('data-bs-dismiss', 'modal');
  dialogHeader.append(filmHeader, closeSeatDialog);
  const dialogBody = element('div', 'modal-body');
  const seatDescription = element(
    'p',
    'text-white mb-2',
    'Choose one seat per ticket. Use arrows to move, Enter or Space to select, and select again to remove.',
  );
  seatDescription.id = 'seat-picker-description';
  const seatHint = element(
    'p',
    'small text-warning d-lg-none mb-0',
    'Swipe the seat map sideways to see every seat.',
  );
  const mobileScreenLabel = element(
    'p',
    'small text-center text-white-50 d-lg-none mb-0',
    'SCREEN',
  );
  const seatMap = element('div', 'overflow-auto pb-2');
  seatMap.id = 'seat-map';
  seatMap.setAttribute('role', 'group');
  seatMap.setAttribute(
    'aria-label',
    'Illustrative seat map with 12 rows and 12 seats per row',
  );
  const rowJump = element('div', 'd-flex align-items-center gap-2 mb-3');
  const rowJumpLabel = element('label', 'fw-semibold', 'Go to row');
  rowJumpLabel.htmlFor = 'seat-row-jump';
  const rowJumpSelect = element('select', 'form-select w-auto bg-dark text-white');
  rowJumpSelect.id = 'seat-row-jump';
  for (let row = 1; row <= 12; row += 1) {
    const option = element('option', '', `Row ${row}`);
    option.value = String(row);
    rowJumpSelect.append(option);
  }
  rowJump.append(rowJumpLabel, rowJumpSelect);
  const seatLegend = element(
    'div',
    'd-flex flex-wrap gap-3 align-items-center small',
  );
  const availableKey = element(
    'span',
    'd-inline-flex align-items-center gap-2',
  );
  availableKey.append(
    element('span', 'badge border border-light rounded-2 px-2 py-2', '1'),
    document.createTextNode('Illustrative seat'),
  );
  const selectedKey = element('span', 'd-inline-flex align-items-center gap-2');
  selectedKey.append(
    element('span', 'badge bg-warning text-black rounded-2 px-2 py-2', '1'),
    document.createTextNode('Selected'),
  );
  seatLegend.append(availableKey, selectedKey);
  const seatStatus = element('p', 'fw-semibold mb-0');
  seatStatus.id = 'seat-selection-status';
  seatStatus.setAttribute('role', 'status');
  seatStatus.setAttribute('aria-live', 'polite');
  const mapDisclaimer = element(
    'p',
    'small text-white-50 mb-0',
    'Illustrative layout only. The real hall and seat availability are unknown; choosing a seat here does not reserve it.',
  );
  dialogBody.append(
    seatDescription,
    rowJump,
    seatHint,
    mobileScreenLabel,
    seatMap,
    seatLegend,
    mapDisclaimer,
  );
  const dialogFooter = element('div', 'modal-footer border-secondary');
  const footerInfo = element('div', 'me-auto');
  footerInfo.append(seatStatus);
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
  let activeSeat = '1-1';

  function focusSeat(seat) {
    activeSeat = seat;
    const target = byId(`seat-${seat}`);
    if (!target) return;
    seatMap.querySelector('[tabindex="0"]')?.setAttribute('tabindex', '-1');
    target.tabIndex = 0;
    target.focus();
    target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    rowJumpSelect.value = seat.split('-')[0];
  }

  rowJumpSelect.addEventListener('change', () => {
    focusSeat(`${rowJumpSelect.value}-1`);
  });
  seatMap.addEventListener('focusin', (event) => {
    const seat = event.target.id?.match(/^seat-(\d+)-(\d+)$/);
    if (!seat) return;
    activeSeat = `${seat[1]}-${seat[2]}`;
    seatMap.querySelectorAll('button').forEach((node) => {
      node.tabIndex = node === event.target ? 0 : -1;
    });
    rowJumpSelect.value = seat[1];
  });
  seatMap.addEventListener('keydown', (event) => {
    const seat = event.target.id?.match(/^seat-(\d+)-(\d+)$/);
    if (!seat) return;
    let row = Number(seat[1]);
    let number = Number(seat[2]);
    switch (event.key) {
      case 'ArrowLeft': number = Math.max(1, number - 1); break;
      case 'ArrowRight': number = Math.min(12, number + 1); break;
      case 'ArrowUp': row = Math.max(1, row - 1); break;
      case 'ArrowDown': row = Math.min(12, row + 1); break;
      case 'Home': number = 1; break;
      case 'End': number = 12; break;
      default: return;
    }
    event.preventDefault();
    focusSeat(`${row}-${number}`);
  });

  function drawSeats() {
    seatMap.replaceChildren();
    const layout = element('div', 'd-table mx-auto');
    const screen = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    screen.setAttribute('viewBox', '0 0 800 90');
    screen.setAttribute('role', 'img');
    screen.setAttribute('aria-label', 'Screen at the front of the hall');
    screen.classList.add('w-100', 'mb-5');
    const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arc.setAttribute('d', 'M 30 65 C 190 5 610 5 770 65');
    arc.setAttribute('fill', 'none');
    arc.setAttribute('stroke', 'white');
    arc.setAttribute('stroke-width', '5');
    arc.setAttribute('stroke-linecap', 'round');
    const screenText = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text',
    );
    screenText.setAttribute('x', '400');
    screenText.setAttribute('y', '66');
    screenText.setAttribute('text-anchor', 'middle');
    screenText.setAttribute('fill', 'white');
    screenText.textContent = 'SCREEN';
    screen.append(arc, screenText);
    layout.append(screen);
    for (let row = 1; row <= 12; row += 1) {
      const line = element(
        'div',
        'd-flex flex-nowrap align-items-center gap-1 mb-2',
      );
      if (row === 1) line.classList.add('mt-5');
      line.append(
        element(
          'strong',
          'font-monospace text-white-50 me-2 flex-shrink-0',
          String(row).padStart(2, '\u00a0'),
        ),
      );
      for (let number = 1; number <= 12; number += 1) {
        const seat = `${row}-${number}`;
        const isSelected = selectedSeats.has(seat);
        const seatButton = button(
          String(number),
          () => {
            if (selectedSeats.has(seat)) selectedSeats.delete(seat);
            else if (selectedSeats.size < pending.target)
              selectedSeats.add(seat);
            else {
              seatStatus.textContent = `You already selected ${pending.target} seats. Remove one to choose a different seat.`;
              return;
            }
            activeSeat = seat;
            drawSeats();
            focusSeat(seat);
          },
          !isSelected,
        );
        seatButton.id = `seat-${seat}`;
        if ([3, 7, 11].includes(number)) seatButton.classList.add('ms-3');
        seatButton.classList.replace(
          isSelected ? 'btn-success' : 'btn-outline-secondary',
          isSelected ? 'btn-warning' : 'btn-outline-light',
        );
        seatButton.classList.replace('py-2', 'py-3');
        seatButton.classList.replace('px-3', 'px-4');
        seatButton.classList.add('rounded-3', 'flex-shrink-0');
        seatButton.tabIndex = seat === activeSeat ? 0 : -1;
        if (isSelected) seatButton.classList.add('text-black');
        seatButton.setAttribute(
          'aria-label',
          `Row ${row}, seat ${number}${isSelected ? ', selected' : ''}`,
        );
        seatButton.setAttribute('aria-pressed', String(isSelected));
        line.append(seatButton);
      }
      line.append(
        element(
          'strong',
          'font-monospace text-white-50 ms-2 flex-shrink-0',
          String(row).padStart(2, '\u00a0'),
        ),
      );
      layout.append(line);
    }
    seatMap.append(layout);
    const ordered = seatIds.filter((seat) => selectedSeats.has(seat));
    seatStatus.textContent = `${selectedSeats.size} of ${pending.target} seats selected.${ordered.length ? ` Selected: ${ordered.join(', ')}.` : ''}`;
    saveSeats.disabled = selectedSeats.size !== pending.target;
    saveSeats.textContent = pending.existing
      ? 'Save selected seats'
      : 'Add selected seats';
  }

  function openSeatPicker(chosen, existing, target, trigger) {
    pending = { chosen, existing, target };
    selectedSeats = new Set(existing?.seats || []);
    activeSeat = existing?.seats?.[0] || '1-1';
    rowJumpSelect.value = activeSeat.split('-')[0];
    returnFocus = trigger || document.activeElement;
    seatsSaved = false;
    const film = findFilm(chosen.session);
    dialogTitle.textContent = film.title;
    filmPoster.src = film.poster;
    filmPoster.alt = `${film.title} film poster`;
    const readableDate = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${chosen.date}T12:00:00`));
    sessionDetails.textContent = `${readableDate} · ${film.time}${film.nextDay ? ' (following calendar day)' : ''} · ${film.age}+`;
    sessionMeta.textContent = `${target} ${target === 1 ? 'ticket' : 'tickets'} · ${money(film.price)} each (estimated)`;
    drawSeats();
    seatModal.show();
  }

  function commitSeats() {
    if (!pending || selectedSeats.size !== pending.target) return;
    const seats = seatIds.filter((seat) => selectedSeats.has(seat));
    if (pending.existing) {
      pending.existing.seats = seats;
      pending.existing.quantity = seats.length;
    } else {
      cart.push({
        key: `${pending.chosen.session}-${pending.chosen.date}`,
        session: pending.chosen.session,
        date: pending.chosen.date,
        quantity: seats.length,
        seats,
      });
    }
    seatsSaved = true;
    invalidate();
    renderCart();
    status(
      error,
      `Seats ${seats.join(', ')} added to your basket. Review your order below.`,
    );
    seatModal.hide();
  }

  seatDialog.addEventListener('shown.bs.modal', () => {
    seatDialog.scrollTop = 0;
    dialogBody.scrollTop = 0;
    rowJumpSelect.focus({ preventScroll: true });
  });
  seatDialog.addEventListener('hidden.bs.modal', () => {
    if (seatsSaved) {
      cartStatus.tabIndex = -1;
      cartStatus.focus();
    } else if (returnFocus?.isConnected) returnFocus.focus();
    else fields.session.focus();
    pending = null;
  });

  function selection() {
    return {
      session: fields.session.value,
      date: fields.date.value,
      quantity: fields.quantity.value,
      age: fields.age.value,
    };
  }

  function invalidate() {
    reviewed = false;
    customerSummary.textContent = '';
    reviewStatus.textContent =
      cart.length === 0
        ? 'Add tickets to begin.'
        : 'Review the basket and your details before confirming.';
    updateActions();
  }

  function liveSelection() {
    const chosen = selection();
    const film = findFilm(chosen.session);
    const quantity = Number(chosen.quantity);
    byId('order-session').textContent = film
      ? `${film.title} — ${film.time}${film.nextDay ? ' (following calendar day)' : ''} (${film.age}+)`
      : 'No session selected';
    byId('order-date').textContent = chosen.date || 'No date selected';
    byId('order-quantity').textContent =
      Number.isInteger(quantity) && quantity > 0 && quantity <= 10
        ? String(quantity)
        : 'Enter 1–10 tickets';
    byId('order-unit-price').textContent = film
      ? `${money(film.price)} (estimated)`
      : 'Choose a session';
    byId('order-total').textContent =
      film && Number.isInteger(quantity) && quantity > 0 && quantity <= 10
        ? `${money(film.price * quantity)} selection estimate — add to basket below`
        : 'Choose a session and quantity';
  }

  function renderCart() {
    renderList(
      cartContainer,
      cart,
      (item) => {
        const film = findFilm(item.session);
        const row = element('article', 'border rounded p-3 mb-2');
        row.append(
          element(
            'h4',
            'h6',
            `${film.title} — ${film.time}${film.nextDay ? ' (following calendar day)' : ''}`,
          ),
          element(
            'p',
            '',
            `${item.date} · ${item.quantity} × ${money(film.price)} = ${money(item.quantity * film.price)}`,
          ),
          element(
            'p',
            'fw-semibold',
            `Selected seats: ${item.seats.join(', ')}`,
          ),
        );
        const controls = element('div', 'd-flex flex-wrap gap-2');
        const minus = button(
          '− 1 ticket',
          () => {
            item.seats = item.seats.slice(0, -1);
            item.quantity = item.seats.length;
            invalidate();
            renderCart();
            status(
              error,
              `One ticket removed. Remaining seats: ${item.seats.join(', ')}.`,
            );
            (byId(`cart-minus-${item.key}`).disabled
              ? byId(`cart-remove-${item.key}`)
              : byId(`cart-minus-${item.key}`)
            ).focus();
          },
          true,
        );
        minus.id = `cart-minus-${item.key}`;
        minus.disabled = item.quantity <= 1;
        minus.setAttribute(
          'aria-label',
          `Remove one ticket: ${film.title}, ${item.date}`,
        );
        const plus = button('+ 1 ticket', (event) =>
          openSeatPicker(item, item, item.quantity + 1, event.currentTarget),
        );
        plus.id = `cart-plus-${item.key}`;
        plus.disabled = item.quantity >= 10;
        plus.setAttribute(
          'aria-label',
          `Add one ticket: ${film.title}, ${item.date}`,
        );
        const edit = button(
          'Change seats',
          (event) =>
            openSeatPicker(item, item, item.quantity, event.currentTarget),
          true,
        );
        edit.setAttribute(
          'aria-label',
          `Change seats: ${film.title}, ${item.date}`,
        );
        const remove = button(
          'Remove session',
          () => {
            cart = cart.filter((entry) => entry.key !== item.key);
            invalidate();
            renderCart();
            (
              cartContainer.querySelector('button:not(:disabled)') ||
              fields.session
            ).focus();
          },
          true,
        );
        remove.id = `cart-remove-${item.key}`;
        remove.setAttribute(
          'aria-label',
          `Remove session: ${film.title}, ${item.date}`,
        );
        controls.append(plus, minus, edit, remove);
        row.append(controls);
        return row;
      },
      'Your ticket basket is empty. Choose a session and add tickets.',
    );
    cartStatus.textContent = `${ticketCount(cart)} tickets · ${cart.length} sessions · Estimated basket total: ${money(cartTotal(cart))}`;
    updateActions();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const chosen = selection();
    const errors = sessionErrors(chosen);
    const existing = cart.find(
      (item) => item.session === chosen.session && item.date === chosen.date,
    );
    if (existing && existing.quantity + Number(chosen.quantity) > 10)
      errors.quantity =
        'The basket already has tickets for this session. Maximum 10 in total.';
    if (
      cart.some(
        (item) => item.date === chosen.date && item.session !== chosen.session,
      )
    )
      errors.date =
        'Choose one session per date. Remove the other session or choose another date.';
    if (
      !validateFields(
        ['session', 'date', 'quantity', 'age'].map((key) => [
          fields[key],
          errors[key],
        ]),
      )
    ) {
      status(
        error,
        'Tickets were not added. Check the highlighted fields.',
        true,
      );
      return;
    }
    openSeatPicker(
      chosen,
      existing,
      (existing?.quantity || 0) + Number(chosen.quantity),
      byId('booking-review'),
    );
  });

  function validateOrder() {
    const errors = [];
    const name = fields.name.value.trim();
    errors.push([
      fields.name,
      name.length < 2 || name.length > 80
        ? 'Enter a name between 2 and 80 characters.'
        : '',
    ]);
    errors.push([
      fields.email,
      !CinemaData.emailValid(fields.email.value) ||
      fields.email.value.trim().length > 120
        ? 'Enter a valid email address, such as name@example.com.'
        : '',
    ]);
    errors.push([
      fields.phone,
      !CinemaData.phoneValid(fields.phone.value)
        ? 'Enter a phone number with 10–15 digits.'
        : '',
    ]);
    errors.push([
      fields.agree,
      !fields.agree.checked
        ? 'Confirm that you understand this is an order summary, not a seat reservation.'
        : '',
    ]);
    const ageErrors = cart.map((item) =>
      sessionErrors({ ...item, age: fields.age.value }),
    );
    errors.push([fields.age, ageErrors.find((item) => item.age)?.age || '']);
    const fieldsValid = validateFields(errors);
    const expired = ageErrors.some(
      (item) => item.date || item.session || item.quantity,
    );
    const missingSeats = cart.some(
      (item) =>
        !Array.isArray(item.seats) || item.seats.length !== item.quantity,
    );
    if (!fieldsValid || expired || missingSeats || cart.length === 0) {
      status(
        error,
        expired
          ? 'A basket session is no longer valid. Remove it and choose another date.'
          : 'Complete the highlighted details and add tickets before reviewing.',
        true,
      );
      return false;
    }
    return true;
  }

  function reviewOrder() {
    if (!validateOrder()) return;
    reviewed = true;
    customerSummary.textContent = `Buyer: ${fields.name.value.trim()} · Email: ${fields.email.value.trim()} · Phone: ${fields.phone.value.trim()} · Youngest visitor: ${fields.age.value}.`;
    reviewStatus.textContent = `Reviewed: ${ticketCount(cart)} tickets (${cart.map((item) => item.seats.join(', ')).join('; ')}), estimated ${money(cartTotal(cart))}. To change details, edit the fields above and review the order again.`;
    updateActions();
    status(
      error,
      'Order reviewed. Check the details before choosing Prepare order.',
    );
    confirm.focus();
  }

  confirm.addEventListener('click', () => {
    if (!reviewed || !validateOrder()) {
      invalidate();
      return;
    }
    const reference = CinemaData.localReference();
    byId('ticket-reference').textContent = reference;
    byId('ticket-session').textContent = cart
      .map(
        (item) =>
          `${findFilm(item.session).title}, ${item.date} ${findFilm(item.session).time}${findFilm(item.session).nextDay ? ' (following calendar day)' : ''}, seats ${item.seats.join(', ')}`,
      )
      .join('; ');
    byId('ticket-quantity').textContent = String(ticketCount(cart));
    byId('ticket-total').textContent =
      `${money(cartTotal(cart))} (estimated)`;
    lastDemoSummary = [
      'Dostar Cinema — order summary',
      `Reference: ${reference}`,
      `Buyer: ${fields.name.value.trim()}`,
      `Phone: ${fields.phone.value.trim()}`,
      `Session: ${byId('ticket-session').textContent}`,
      `Tickets: ${ticketCount(cart)}`,
      `Total: ${money(cartTotal(cart))} (estimated)`,
      'No payment was taken and no seats were reserved.',
    ].join('\n');
    result.classList.remove('is-hidden');
    updateActions();
    status(
      byId('booking-status'),
      'Order summary prepared on this device. No payment was taken, no email was sent and no seats were reserved. Contact the cinema to confirm availability.',
    );
    result.classList.add('is-success');
    result.tabIndex = -1;
    result.focus();
    cart = [];
    invalidate();
    renderCart();
    status(error, 'Summary prepared. Add tickets to prepare another order.');
  });

  form.addEventListener('input', (event) => {
    if (event.target.id) CinemaUI.errorFor(event.target, '');
    if (
      [fields.session, fields.date, fields.age, fields.quantity].includes(
        event.target,
      )
    ) {
      ['session', 'date', 'age', 'quantity'].forEach((key) =>
        CinemaUI.errorFor(fields[key], ''),
      );
    }
    error.classList.add('is-hidden');
    invalidate();
    liveSelection();
  });
  form.addEventListener('change', () => {
    invalidate();
    liveSelection();
  });
  const requested = new URLSearchParams(location.search).get('session');
  if (findFilm(requested)) fields.session.value = requested;
  liveSelection();
  invalidate();
  renderCart();
})();
