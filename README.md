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

All six pages are independently reachable. The logo opens Home. Movies and Schedule are primary links, and the Details dropdown contains Cinema, Visit and Reviews. Sign in and My tickets are dialogs available from every page.

## Visitor journeys

1. **Find the cinema.** From Home, open **Details > Visit**. Check the address, interactive map, contacts and daily opening hours, then scroll down to see the entrance photos.
2. **Try a ticket order.** On **Movies**, choose a film and screening, select one or more seats and choose a ticket type for each. Apply `WEB1` for 20% off. If asked to sign in, enter a sample name, phone number and any 16-digit test card number, such as `4242 4242 4242 4242`. Save the ticket and reopen it in **My tickets**. **Schedule** is for browsing films and showtimes by date; it does not open the ticket order.
3. **Leave a review.** Open **Details > Reviews** and sign in. The form fills in your profile name. Choose one to five stars, write a review and select **Post review**. Your review appears with its rating and date. You can edit or delete it during the same sign-in session.

## Endterm functionality and defense topics

| Page or feature | What changed by Endterm | Technology and files | Review and defense lead |
|---|---|---|---|
| Home | A featured-film carousel links to each film's showtimes. | jQuery, `js/jquery-home.js` | Daniyar Nataliyev |
| Movies | The catalogue shows 24 films with search, category and age filters, sorting and a saved-film shortlist. | jQuery for rendering and events in `js/movies.js`, JavaScript for data and filtering in `js/data.js` | Daniyar Nataliyev |
| Schedule listings | Dates filter upcoming showtimes grouped by film. Times and starting prices are displayed for comparison; ordering starts on Movies. | JavaScript, `js/schedule.js` and `js/data.js` | Daniyar Nataliyev |
| Seat selection and ticket totals | Visitors can choose several seats, choose a ticket type for each and apply the `WEB1` discount. | JavaScript, `js/booking.js` | Sandzhar Fazyl |
| My tickets | The shared dialog displays tickets saved in the browser. The seat picker uses saved tickets to mark occupied seats for the selected showing. | JavaScript, `js/main.js` and `js/booking.js` | Sandzhar Fazyl |
| Cinema and navigation | The Cinema page shows venue facts and photos. The Details menu groups Cinema, Visit and Reviews. The separate Halls page was removed. | JavaScript and Bootstrap, `js/main.js`. The Halls removal also changed the source HTML. | Sandzhar Fazyl |
| Profile validation | Local sign-in validates the sample profile fields before tickets are saved from Movies. | JavaScript, `js/main.js` | Nauryzbay Kinayatov |
| Reviews | Signed-in visitors can rate their visit and post, edit or delete their own reviews. The page shows the average rating and lets visitors sort the list. | jQuery, `js/jquery-services.js` | Nauryzbay Kinayatov |
| Visit | Shows an interactive map, address, contacts, daily opening hours and entrance photos. | JavaScript, `js/visit.js` and `js/main.js` | Nauryzbay Kinayatov |

## Data and scope

The schedule, hall assignments, seat map and tariffs are examples. Dates are displayed in Astana time. The site saves ticket details and seat selections to this browser, without reserving real seats or charging money. A local profile stores only the name for this tab. The sample card, phone and email are not saved with tickets. Reviews are visible in the current tab until the page reloads.

The interface uses JavaScript, jQuery and existing Bootstrap/base classes. The HTML retains the original page structure with navigation updated for the current page list. `js/old-js-version.js` remains an unlinked comparison archive.
