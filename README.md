# Dostar Cinema

A six-page front-end project for browsing films, comparing sessions, trying a local ticket order and planning a cinema visit.

## Run

Open `index.html` with VS Code Live Server, or run `python -m http.server 8000` and visit `http://localhost:8000/`. The shared booking module loads over HTTP. Bootstrap 5.3.3 and jQuery 3.7.1 load from CDNs. There is no build step.

## Team and earlier contributions

| Team member | Contribution recorded in the project history |
|---|---|
| Sandzhar Fazyl | Built the Cinema and Halls pages and adapted them to Bootstrap (`bf2f737`). |
| Daniyar Nataliyev | Worked on Home, Movies and Schedule. Added an earlier film catalogue and ticket flow, then updated the films and jQuery movie controls (`65eff89`, `092ecdf`). |
| Nauryzbay Kinayatov | Built and refined Visit and Services and adapted both pages to Bootstrap (`d07a1c4`, `6f9e552`). |

All six pages are independently reachable. The logo opens Home. Movies and Schedule are primary links, and the Details dropdown contains Cinema, Visit and Services & Reviews. Sign in and My tickets are dialogs available from every page.

## Visitor journeys

1. **Find the cinema.** From Home, open **Details > Visit**. Check the address and phone, or open **See arrival directions** for the entrance photos.
2. **Try a ticket order.** On **Movies**, choose a film and screening, select one or more seats and choose a ticket type for each. Apply `WEB1` for 20% off. If asked to sign in, enter a sample name and phone number and use `4242 4242 4242 4242`. Save the ticket and reopen it in **My tickets**. On **Schedule**, pick a date and a showtime to open the same seat picker. After choosing ticket types, enter your contact details and the youngest viewer's age in the booking dialog.
3. **Leave feedback.** From **Details > Services & Reviews**, enter a name, email, phone, topic and message, and agree to display the review in this tab. Fix any highlighted errors and submit. The card shows the name, topic, date and message, and can be edited or deleted.

## Endterm functionality and defense topics

| Page or feature | What changed by Endterm | Technology and files | Review and defense lead |
|---|---|---|---|
| Home | A featured-film carousel links to each film's showtimes. | jQuery, `js/jquery-home.js` | Daniyar Nataliyev |
| Movies | The catalogue shows 24 films with search, category and age filters, sorting and a saved-film shortlist. | jQuery for rendering and events in `js/movies.js`, JavaScript for data and filtering in `js/data.js` | Daniyar Nataliyev |
| Schedule listings | Dates filter upcoming showtimes grouped by film. Selecting a time opens the shared seat picker. | JavaScript, `js/schedule.js` and `js/data.js` | Daniyar Nataliyev |
| Seat selection and ticket totals | Visitors can choose several seats, choose a ticket type for each and apply the `WEB1` discount. | JavaScript, `js/booking.js` | Sandzhar Fazyl |
| My tickets | The shared dialog displays tickets saved in the browser. The seat picker uses saved tickets to mark occupied seats for the selected showing. | JavaScript, `js/main.js` and `js/booking.js` | Sandzhar Fazyl |
| Cinema and navigation | The Cinema page shows venue facts and photos. The Details menu groups Cinema, Visit and Services & Reviews. The separate Halls page was removed. | JavaScript and Bootstrap, `js/main.js`. The Halls removal also changed the source HTML. | Sandzhar Fazyl |
| Booking and profile validation | Schedule reuses the buyer form in the booking dialog and checks contact details and the youngest viewer's age. Local sign-in validates the sample profile fields. | JavaScript, `js/schedule.js` and `js/main.js` | Nauryzbay Kinayatov |
| Services & Reviews | The form shows errors beside fields. Visitors can add, edit, delete and sort reviews within the page. | jQuery, `js/jquery-services.js` | Nauryzbay Kinayatov |
| Visit | The directions link jumps to the entrance photos. The departure calculator and text above the photos were removed from the displayed page. | JavaScript, `js/visit.js` and `js/main.js` | Nauryzbay Kinayatov |

## Data and scope

The schedule, hall assignments, seat map and tariffs are examples. Dates are displayed in Astana time. The site saves ticket details and seat selections to this browser, without reserving real seats or charging money. A local profile stores only the name for this tab. The sample card, phone and email are not saved with tickets. Services reviews stay in the page, and contact details are not published.

The interface uses JavaScript, jQuery and existing Bootstrap/base classes. The HTML retains the original page structure with navigation updated for the current page list. `js/old-js-version.js` remains an unlinked comparison archive.