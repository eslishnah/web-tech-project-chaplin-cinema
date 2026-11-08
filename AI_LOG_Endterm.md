# Endterm AI log

- **Project:** Dostar Cinema
- **Team:** Sandzhar Fazyl, Daniyar Nataliyev, Nauryzbay Kinayatov

These study notes summarize explanations and include reconstructed questions about the JavaScript and jQuery concepts used in the project.

**1. What is JavaScript used for on a website?**

It responds to actions, updates content and handles tasks such as filtering films or validating a form.

**2. What is jQuery, and why use it?**

jQuery is a JavaScript library that makes DOM selection, event handling and effects shorter to write.

**3. How do HTML, CSS and JavaScript work together?**

HTML provides the structure, CSS styles it, and JavaScript updates it or reacts to user actions.

**4. What is the DOM?**

The DOM is the browser's tree of page elements. JavaScript can read or change those elements.

**5. What are the main JavaScript data types?**

The primitive types are string, number, bigint, boolean, undefined, symbol and null. Arrays are objects.

**6. When should we use an object instead of an array?**

An object groups named properties, such as a film's title and rating. An array holds a list, such as all films.

**7. How can we create a pop-up window?**

Create a `<dialog>` element, give it content and a close button, then use the browser's dialog methods.

**8. What is form validation?**

It checks whether values meet the rules before the application accepts them. Examples include required fields and valid email formats.

**9. What is a regular expression?**

It is a pattern for matching text. `emailValid()` in `js/data.js` uses one for a basic email format check.

**10. What does `$(function () { ... })` do?**

It runs the callback when the DOM is ready, so the script can find the elements it needs.

**11. How do `showModal()`, `show()` and `close()` differ?**

For a native `<dialog>`, `showModal()` blocks interaction with the page behind it. `show()` keeps the page interactive, and `close()` dismisses the dialog.

**12. What is event delegation?**

A listener on a parent handles events from matching descendants. It keeps working when those descendants are recreated.

**13. How do `.find()`, `.closest()` and `.siblings()` differ?**

`.find()` searches descendants, `.closest()` starts at the selected element and walks up, and `.siblings()` looks at elements with the same parent.

**14. What is the difference between `.attr()` and `.prop()`?**

`.attr()` reads or changes an attribute. `.prop()` accesses a DOM property, such as a checkbox's current `checked` state.

**15. When should we use `.text()`, `.html()` or `.val()`?**

Use `.text()` for plain text, `.html()` for trusted markup and `.val()` for a form field's value.

**16. Why call `event.preventDefault()` when handling a form?**

It stops normal form submission so the handler can validate the fields and decide what happens next.

**17. What is the difference between `localStorage` and `sessionStorage`?**

Local storage usually survives closing the browser. Session storage lasts for the tab's page session.

**18. How do `.fadeIn()`, `.fadeOut()` and `.slideDown()` differ?**

The fade methods animate opacity while showing or hiding an element. `.slideDown()` reveals an element by expanding it.

**19. How can one booking dialog show several steps?**

The `show()` helper in `js/booking.js` changes the title and uses `replaceChildren()` to swap in each step's content.

**20. Why is `booking.js` loaded with `import()`?**

Movies and Schedule load the shared booking module when a visitor opens a film or chooses a showing.

**21. Why does the Movies page attach save clicks to the list?**

Its delegated `.on('click', '.movie-save', ...)` handler still catches clicks after filters recreate the cards.

**22. How does Schedule show each film only once?**

`renderSchedule()` pairs each film with its upcoming screenings for the selected date and renders one card per film with screenings.

**23. How does the seat map know if a seat is taken?**

It checks stored tickets for the same screening key and seat ID. A different showing has its own screening key.

**24. How is the `WEB1` discount calculated?**

`ticketData()` rounds 20% of the selected ticket type's price and subtracts that amount for each seat.

**25. Why does a saved film stay marked after a refresh?**

`js/movies.js` stores saved IDs in local storage and reads them when the catalogue loads.

**26. How do errors appear next to the correct review fields?**

`js/jquery-services.js` finds each field's error element with `.siblings('.field-error')` and inserts the message with `.text()`.

**27. How does the Home carousel disable its arrows?**

`js/jquery-home.js` compares the current scroll position with the track boundaries and updates the buttons with `.prop('disabled', ...)`.
