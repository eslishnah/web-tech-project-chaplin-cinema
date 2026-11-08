# Dostar Cinema

A seven-page front-end project for browsing films, comparing sessions, trying a local ticket order and planning a cinema visit.

## Run

Open `index.html` with VS Code Live Server, or run `python -m http.server 8000` and visit `http://localhost:8000/`. The shared booking module loads over HTTP. Bootstrap 5.3.3 and jQuery 3.7.1 load from CDNs. There is no build step.

## Pages and original responsibilities

| Pages | Original responsibility | Visitor actions |
|---|---|---|
| Home, Movies, Schedule | Daniyar | Search for a page, browse films, compare screenings and create a local ticket order |
| Cinema, Halls | Sandzhar | Read about the cinema and its halls, use the visit checklist and leave hall feedback |
| Visit, Services | Nauryzbay | Find the cinema, estimate when to leave and use the validated feedback form |

All seven pages remain independently reachable. The logo opens Home. Movies and Schedule are primary links, and the Cinema dropdown contains Cinema, Halls, Visit and Services & Reviews. Sign in and My tickets are dialogs available from every page.

## Visitor journeys

1. **Find the cinema.** From Home, open **Cinema → Visit**. Check the address and phone, or open **See arrival directions** for the entrance photos. Optionally enter a date, time and travel estimate in the departure planner.
2. **Try a ticket order.** On **Movies**, choose a film and screening, select one or more seats and choose a ticket type for each. Apply `WEB1` for 20% off. If asked to sign in, enter a sample name and phone number and use `4242 4242 4242 4242`. Save the ticket and reopen it in **My tickets**. You can start the same seat-selection flow from the separate **Schedule** page after reviewing its booking form.
3. **Leave feedback.** From **Cinema → Services & Reviews**, enter a name, email, phone, topic and message, and agree to display the review in this tab. Fix any highlighted errors and submit. The card shows the name, topic, date and message, and can be edited or deleted.

## Functionality Plan

| Page | Goal | Implementation | Expected result |
|---|---|---|---|
| Home | Find a section and adjust readability | `js/jquery-home.js` and `js/jquery-reading.js` | Page results by category and saved text-size preference |
| Movies | Find and shortlist a film | `js/data.js` and `js/movies.js` | 24 poster cards, category and age filters, search, sorting and a green outline for saved films |
| Schedule | Review a session and buyer details | `js/schedule.js` | Dated screening list, contact and age validation, price estimate and access to the shared seat picker |
| Movies and Schedule | Choose seats and save tickets | `js/booking.js` | Seat map, per-seat ticket types, quantity and discount calculations, local ticket reference |
| Cinema | Prepare for a visit | `js/cinema.js` | Checklist tailored to the visitor |
| Halls | Leave hall feedback | `js/halls.js` and `js/reviews.js` | Validated review with rating, date, edit and delete |
| Visit | Find the entrance and plan departure | `js/visit.js` | Address, local directions and estimated departure time |
| Services | Leave a local review | `js/jquery-services.js` | Field-specific errors, email and phone validation, character counter, dated review cards and sorting |
| Shared | Navigate and see tickets | `js/main.js` | Compact navigation, local profile and My tickets |

## Data and scope

The schedule, hall assignments, seat map and tariffs are examples. Dates are displayed in Astana time. The site saves ticket details and seat selections to this browser, without reserving real seats or charging money. A local profile stores only the name for this tab. The sample card, phone and email are not saved with tickets. Services reviews stay in the page, and contact details are not published.

The integrated HTML and CSS files match the base `main` commit. The new interface uses JavaScript, jQuery and existing Bootstrap/base classes. `js/old-js-version.js` remains an unlinked comparison archive.

The Assignment 4–5 JavaScript checklist and existing screenshots record earlier stages. See [AI_LOG_Endterm.md](AI_LOG_Endterm.md) for the current integration and AI assistance.
