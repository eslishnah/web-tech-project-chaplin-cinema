# Dostar Cinema — Assignments 4–5

This is our seven-page frontend project for Dostar Cinema. We continued the site from the earlier assignments and added JavaScript to help visitors find a film, try a ticket order, read about the cinema, leave local feedback and plan a visit. The order flow is a practice demo: it does not take payment, reserve seats or send messages.

## Team responsibilities

| Student | Pages | JavaScript files |
|---|---|---|
| Daniyar | Home, Movies, Schedule | `js/data.js`, `js/movies.js`, `js/schedule.js` |
| Sandzhar | Cinema, Halls | `js/cinema.js`, `js/halls.js` |
| Nauryzbay | Visit, Services | `js/visit.js`, `js/services.js` |

We divided the pages by feature area and worked on `js/main.js` and `js/reviews.js` as shared parts of the site. Our AI assistance log is in `AI_LOG_Assignment_4_5.md`.

## Pages and visitor journeys

| Page | What a visitor can do |
|---|---|
| `index.html` | Start and choose another section of the site |
| `movies.html` | Browse films, filter them and save a shortlist on this device |
| `schedule.html` | Choose a session and seats, review a demo ticket basket |
| `cinema.html` | Read about the cinema and make a visit checklist |
| `halls.html` | Read hall information and add a local review |
| `visit.html` | Find the address, map and phone number; plan a departure time |
| `services.html` | Read about services and prepare local feedback |

Three complete routes through the site:

1. **Find the cinema:** Home → Visit → check the location and route → use the map or phone link. The visitor finishes with directions or a contact option.
2. **Try a ticket order:** Movies → search or filter → choose a film → Schedule → enter the date, ticket count and youngest visitor's age → select the same number of seats in the illustrative map → review the basket, buyer details and consent → confirm the demo. Changing details or seats requires a new review. The confirmation shows a demo reference and clears the basket; it is not a real ticket.
3. **Check facilities:** Home → Cinema → Halls → Services → Visit. The visitor can check the published hall and parking information and then contact the cinema.

## Functionality Plan

| Page | Visitor goal | Function | Expected result | Responsible student |
|---|---|---|---|---|
| All pages | Find a section and read comfortably | Page search, category filter, reset, larger-text setting and skip link | Matching destinations and count, an empty message when needed, saved reading preference | Shared team |
| Movies | Choose a suitable film | Search, age filter and sorting together | Matching film cards, count, reset and link to the selected session | Daniyar |
| Movies | Keep a shortlist | Save/remove films and show saved films only | Saved film IDs on this device, with feedback if storage is unavailable | Daniyar |
| Schedule | Try a ticket order | Seat selection, basket changes, totals and review | Seat labels and updated totals after add, increase, decrease, remove or clear | Daniyar |
| Schedule | Complete the demo safely | Date, age, count and buyer validation; confirmation | Field errors or a DEMO reference with an explicit no-payment/no-reservation message | Daniyar |
| Cinema | Prepare for a visit | General, family or assistance checklist | Relevant steps, progress, reset and useful links | Sandzhar |
| Halls | Share a local review | Validation, character counter, rating, sort, edit and delete | A review card with date/time, average rating and empty/duplicate feedback | Sandzhar |
| Visit | Plan travel to a session | Date, time, travel and buffer calculation | A departure time or an explanation of an invalid or impossible plan | Nauryzbay |
| Services | Prepare feedback | Name, email, topic and message validation; sort, edit and delete | A local feedback card; the email is not displayed or sent | Nauryzbay |

## How to run it

The site runs from `index.html` with VS Code Live Server or another static server; it has no build step. Bootstrap 5.3.3 CSS and the navigation bundle load from jsDelivr and need an internet connection. We load the scripts with `defer` in this order: `js/data.js`, `js/main.js`, then the page script. The project uses plain JavaScript and no jQuery.

## Data and demo rules

- We kept the three existing film examples and posters. `CinemaData.pages` contains seven site destinations, each with an ID, title, link, category and description for the shared page search.
- KZT 1,000 per ticket is a demo estimate based on older starting-price examples, not a confirmed current price. The film examples were checked on 4 October 2026 and are not a live schedule. Historical source: https://ticketon.kz/en/place/dostar-cinema. Official site: https://dostarcinema.kz/. Confirm current films, prices, times and venue details with the cinema before visiting.
- The demo accepts dates from today through the next 30 days according to the device's local clock and rejects session times that have already passed today. It allows one session per date, 1–10 tickets per session and requires the youngest visitor to meet the film's age rating. These rules do not represent live availability.
- The 12 × 12 seat map is illustrative. Seat labels appear in the local basket, but the actual hall, layout and free seats are unknown. Selecting a seat here does not reserve it.
- `Math.random()` helps create a temporary DEMO reference. It is not a booking number or security credential.
- Only the larger-text preference and film shortlist IDs use `localStorage`. The basket, buyer details, notes and reviews stay in page memory and disappear on reload. Nothing is sent to a server.
- The site does not include login or registration.

## HTML/CSS starting point

We added deferred script links to the HTML and kept `css/base.css` unchanged. JavaScript creates the new interface elements and uses existing Bootstrap/base classes through `classList` for visual states. We did not add CSS rules, inline styles or inline event handlers.

We also corrected two issues in the earlier pages through JavaScript. `js/visit.js` removes a newline and an extra final digit from the map URL; the external destination has not been independently rechecked. `js/halls.js` replaces a statement suggesting that the demo assigns a real hall with advice to contact the cinema. These corrections are separate from the new visitor features.

## Checks and project documents

The visual refresh removed the redundant navigation buttons identified in the screenshots. Shared JavaScript adds green page introductions with small orange accents, consistent cards, a quieter footer, venue details and service FAQs. Movie selection, map access, navigation and checkout remain available. This refresh did not require HTML or CSS source edits.

We check the data logic with `node --test tests/logic.test.cjs tests/freeze.test.cjs`. Browser checks use `node tests/browser.cjs` with development-only Playwright and Chrome; the manual steps are in `tests/evidence/README.md`. Our evidence covers widths near 375 px, 768 px and desktop, plus larger-text mode. These checks do not certify full accessibility or verify live cinema information.

- `JAVASCRIPT_CHECKLIST.md` maps the assignment requirements to source files and line numbers.
- `AI_LOG_Assignment_4_5.md` records AI assistance.
- `tests/evidence/` contains the browser-check scope and screenshots; `evidence/` also contains page and seat-map screenshots.
