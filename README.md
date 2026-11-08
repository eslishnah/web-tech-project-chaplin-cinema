# Dostar Cinema — Endterm project

This is our eight-page frontend project for Dostar Cinema. Visitors can find a film, choose a session, prepare an order summary, read about the cinema, leave local feedback and plan a visit. Payment and actual seat reservation require a cinema service and are not available on this static site.

## Team responsibilities

| Student | Pages | JavaScript files |
|---|---|---|
| Daniyar | Home, Movies, Schedule, Booking | `js/data.js`, `js/movies.js`, `js/schedule.js` |
| Sandzhar | Cinema, Halls | `js/cinema.js`, `js/halls.js` |
| Nauryzbay | Visit, Services | `js/visit.js`, `js/services.js` |

We divided the pages by feature area and worked on `js/main.js` and `js/reviews.js` as shared parts of the site. The Assignment 6 study log is in `AI_LOG_Assignment_6.md`.

## Endterm extensions since the previous defence

The earlier project was extended rather than resubmitted unchanged:

- Movies now has a complete saved-film flow: visitors can save or remove individual films, view only their shortlist and clear the whole shortlist. The result count, disabled state and status message update immediately.
- Schedule now creates a required phone field in JavaScript and validates both phone and email before review. The same reusable phone rule is also used by the Services form.
- After a successful Booking review, visitors can copy a readable local summary containing the reference, buyer, phone, session, seats, ticket count and estimated total. The control remains disabled until the summary is prepared.
- The catalogue now includes The Cat in the Hat, Qudiret and Little Demons Journey to the West. Their screenshot session prices flow through the film cards, Schedule list and demo total; the age filter includes 6+ and 12+ choices.
- Repeated cross-page buttons were removed from Services, Halls and the Cinema checklist. Home keeps three distinct starting routes, Movies links each showing directly to its order, and Visit keeps the map action.
- Movies now presents film information without repeating every session. Schedule lists session times and prices, with a direct selection link to the new Booking page. Booking contains the form, illustrative seat map, basket and local order summary.
- Schedule groups the 19 sessions by film in a three-column table with compact film headings. Each time shows its own price and opens Booking with that exact session selected; a film-specific link from Movies narrows the view.
- Booking presents one primary action at a time: choose seats, review order, then prepare order. Clear basket appears only when it contains tickets, and Copy order summary appears beside the finished result. Editing details or seats requires another review.
- The main action labels are consistent across pages: Choose a film → Choose a session → Choose seats → Review order → Prepare order. Informational text still explains that the result is a local summary, not a reservation.
- All new interface elements are created by JavaScript and use existing Bootstrap classes. No new HTML elements or CSS rules were written by hand for these extensions.

## Pages and visitor journeys

| Page | What a visitor can do |
|---|---|
| `index.html` | Start and choose another section of the site |
| `movies.html` | Browse films, filter them and save a shortlist on this device |
| `schedule.html` | Compare session times and prices and choose a session |
| `booking.html` | Choose seats, review the basket and prepare a local order summary |
| `cinema.html` | Read about the cinema and make a visit checklist |
| `halls.html` | Read hall information and add a local review |
| `visit.html` | Find the address, map and phone number; plan a departure time |
| `services.html` | Read about services and prepare local feedback |

Three complete routes through the site:

1. **Find the cinema:** Home → Visit → check the location and route → use the map or phone link. The visitor finishes with directions or a contact option.
2. **Prepare an order:** Movies → choose a film → Schedule → choose a time → Booking → enter the date, ticket count and buyer details → select seats in the illustrative map → review and prepare a local summary. Changing details or seats requires another review. The summary has a LOCAL reference and clears the basket; it is not a real ticket.
3. **Check facilities:** Home → Cinema → Halls → Services → Visit. The visitor can check the published hall and parking information and then contact the cinema.

## Functionality Plan

| Page | Visitor goal | Function | Expected result | Responsible student |
|---|---|---|---|---|
| Home | Find a section and change reading size | Page search, category filter, reset and larger-text setting | Matching destinations and count, an empty message when needed, saved reading preference | Shared team |
| Movies | Choose a suitable film | Search, age filter and sorting together | Matching film cards, count, reset and link to the selected session | Daniyar |
| Movies | Keep a shortlist | Save/remove films and show saved films only | Saved film IDs on this device, with feedback if storage is unavailable | Daniyar |
| Schedule | Choose a time | Film-specific or complete session list with prices | One selected time opens Booking | Daniyar |
| Booking | Prepare an order | Seat selection, basket changes, totals and review | Seat labels and updated totals after add, increase, decrease, remove or clear | Daniyar |
| Booking | Complete the local summary | Date, age, count, email, phone and buyer validation; summary copy | Field errors or a LOCAL reference with an explicit no-payment/no-reservation message | Daniyar |
| Cinema | Prepare for a visit | General, family or assistance checklist | Relevant steps, progress, reset and useful links | Sandzhar |
| Halls | Share a local review | Validation, character counter, rating, sort, edit and delete | A review card with date/time, average rating and empty/duplicate feedback | Sandzhar |
| Visit | Plan travel to a session | Date, time, travel and buffer calculation | A departure time or an explanation of an invalid or impossible plan | Nauryzbay |
| Services | Prepare feedback | Name, email, topic and message validation; sort, edit and delete | A local feedback card; the email is not displayed or sent | Nauryzbay |

## How to run it

The site runs from `index.html` with VS Code Live Server or another static server; it has no build step. Bootstrap 5.3.3 and jQuery 3.7.1 load from CDNs and need an internet connection. Deferred scripts load in this order: `js/data.js`, `js/main.js`, jQuery, `js/jquery-reading.js`, then any page script. Other existing page features retain their plain JavaScript.

## Assignment 6 jQuery work

- `js/jquery-home.js` rewrites the home page search. The panel slides open and closed. The eight page links are built from the `CinemaData.pages` array, not written in the HTML.
- `js/jquery-reading.js` adds a text-size control to every page and applies the saved choice across the site.
- `js/movies.js` rewrites movie filtering, sorting and saved-film buttons with jQuery. Cards and links to each film's Schedule view are built from the film array; save buttons use delegated clicks because the cards change.
- `js/jquery-services.js` rewrites the Services feedback form and local review cards with jQuery. A required phone field is created in code. Every field receives its own error message; email and phone are checked, and errors update as values change. After a valid submission the form resets and the local review appears below. Email and phone are never displayed or stored in the review array.
- `js/old-js-version.js` is an unlinked comparison archive of the earlier plain-JavaScript implementations. The jQuery files contain brief comparison comments.
- Effects respond to visitor actions: the Home tools slide open, film results fade when filters change, and a local review confirmation slides into view. Review deletion fades its card out.

## Data and demo rules

- The six film examples are Zamanback 2, Bazha Kinoda, Whalefall, The Cat in the Hat, Qudiret and Little Demons Journey to the West. The added film times, age ratings, languages and price examples came from the supplied screenshots. The new local posters came from Freedom Ticketon (Cat and Qudiret) and KINO.KZ (Little Demons). `CinemaData.pages` contains eight site destinations for the Home page search.
- Prices vary by session in the supplied screenshots and are not confirmed current prices. The screenshots are fixed examples, not a live schedule. Listing sources: https://ticketon.kz/place/dostar-cinema and https://kino.kz/ru/movie/12420. Official site: https://dostarcinema.kz/. Confirm current films, prices, times and venue details with the cinema before visiting. The 00:15 Bazha Kinoda showing is treated as after midnight on the following calendar day.
- The local order flow accepts dates from today through the next 30 days according to the device's clock and rejects session times that have already passed. It allows one session per cinema day, 1–10 tickets per session and requires the youngest visitor to meet the film's age rating. These rules do not represent live availability.
- The 12 × 12 seat map is illustrative. Visitors can jump to a row, move between seats with arrow keys and select with Enter or Space. Seat labels appear in the local basket, but the actual hall, layout and free seats are unknown. Selecting a seat here does not reserve it.
- `Math.random()` helps create a temporary DEMO reference. It is not a booking number or security credential.
- Only the larger-text preference and film shortlist IDs use `localStorage`. The basket, buyer details, notes and reviews stay in page memory and disappear on reload. Nothing is sent to a server.
- The site does not include login or registration.

## HTML/CSS starting point

We added deferred script links to the HTML and kept `css/base.css` unchanged. JavaScript creates the new interface elements and uses existing Bootstrap/base classes for visual states. We did not add CSS rules, inline styles or inline event handlers.

The Visit map button uses the 2GIS location link supplied by the team. `js/halls.js` advises visitors to contact the cinema to confirm the hall and seating. The site does not assign real seats.

## Checks and project documents

The visual refresh removed the redundant navigation buttons identified in the screenshots. Shared JavaScript adds green page introductions with small orange accents, consistent cards, a quieter footer, venue details and service FAQs. Movie selection, map access, navigation and checkout remain available. This refresh did not require HTML or CSS source edits.

The JavaScript files passed syntax checks. On 8 November 2026, a local Chrome pass with CDN access opened all seven pages at 1280 × 800 and 390 × 844 with no console/page errors and no horizontal document overflow. It also completed the Movies save-and-clear flow and the Schedule flow from buyer details and two selected seats through review, DEMO confirmation and clipboard copy. Earlier desktop and mobile screenshots are in `evidence/`. These checks do not certify full accessibility or verify live cinema information.

- `JAVASCRIPT_CHECKLIST.md` maps the assignment requirements to source files and line numbers.
- `AI_LOG_Assignment_4_5.md` records AI assistance.
- `AI_LOG_Endterm.md` records the final endterm review, extensions and browser QA.
- `evidence/` contains page and seat-map screenshots, including the Assignment 6 desktop review images.
