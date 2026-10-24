# AI Assistance Log - Assignment 4-5

**Course:** WEB Technologies 1 (Front End)  
**Project:** Team website continued from Assignments 1-3 and the Midterm Project  
**Topics:** JavaScript fundamentals, arrays, functions, DOM, events, filtering, calculations, and form validation

## Note

This log was reconstructed after the project was completed. It summarizes the kinds of questions we asked AI during development and the guidance we used. AI was used for explanations, debugging ideas, and code review. The team reviewed, adapted, tested, and remained responsible for the final code.

---

## 1. Organizing JavaScript files

**Date:** October 21, 2026

**Student question:**  
How should we organize JavaScript for a multi-page website without putting all the code in one file?

**AI answer:**  
Put shared behavior in `js/main.js` and page-specific behavior in clearly named files. Load scripts with `defer` so they run after the HTML is parsed. Add `'use strict';` at the top of every JavaScript file. Keep data, helper functions, rendering functions, event handlers, and initialization code in separate sections.

**Project note:**  
We used a shared file for site-wide behavior and separate files for page features.

---

## 2. Choosing between `const` and `let`

**Date:** October 21, 2026

**Student question:**  
When should we use `const` and when should we use `let`?

**AI answer:**  
Use `const` by default. Use `let` only when the variable itself must be assigned a new value, such as a counter or current filter. An array declared with `const` can still be updated with methods such as `push()` because the variable continues to reference the same array. Avoid `var` because its function scope and hoisting behavior can cause confusing bugs.

**Project note:**  
We reviewed variable declarations and changed unnecessary `let` declarations to `const`.

---

## 3. Creating realistic project data

**Date:** October 21, 2026

**Student question:**  
What is a good structure for the required array of objects?

**AI answer:**  
Create at least six realistic objects representing the organization’s actual items, services, events, or other content. Give every object a stable `id` and at least four meaningful properties, for example `name`, `category`, `price`, and `available`. Keep property names consistent so the same filtering, sorting, calculation, and rendering functions can work with every object.

**Project note:**  
The project data was kept in one consistent array instead of being duplicated in several event handlers.

---

## 4. Writing reusable functions

**Date:** October 21, 2026

**Student question:**  
How can we make our functions reusable instead of repeating code?

**AI answer:**  
Each function should perform one clear task, accept the values it needs as parameters, and return a useful result when possible. For example, one function can filter an array, another can calculate a total, and a rendering function can call a helper that creates one card. Avoid reading every value directly from the page inside all functions because that makes them harder to test and reuse.

**Project note:**  
We separated data processing from DOM rendering and reused the same item-rendering logic after filters changed.

---

## 5. Strict equality and logical operators

**Date:** October 22, 2026

**Student question:**  
Why does the assignment require `===` and `!==` instead of `==` and `!=`?

**AI answer:**  
Strict equality compares both the value and its type, so it avoids unexpected automatic type conversion. For example, `0 == false` is true, but `0 === false` is false. Convert form values deliberately with `Number()` when a number is required, and then compare them with strict equality. Use `&&` when all conditions must be true and `||` when at least one condition may be true.

**Project note:**  
We used strict comparisons and explicit number conversion in conditions and validation.

---

## 6. Adding a meaningful `Math.random()` feature

**Date:** October 22, 2026

**Student question:**  
How can we use `Math.random()` without making a false business promise?

**AI answer:**  
Use it for a harmless interface feature, such as choosing a featured item from the existing array or creating a temporary demonstration reference after a successful form submission. Label the result as a demo reference and do not claim that it represents a real booking, payment, or order.

**Project note:**  
Randomness was limited to a demonstration result and did not affect real availability or guarantees.

---

## 7. Rendering cards with DOM methods

**Date:** October 22, 2026

**Student question:**  
How do we render repeated cards without adding new HTML blocks manually?

**AI answer:**  
Create one function that receives an object and returns a card element. Use `document.createElement()`, `textContent`, `setAttribute()` when needed, and `classList.add()`. A second function should clear the prepared container, loop through the array, call the card function for each object, and append the results. If the array is empty, render a clear no-results message.

**Project note:**  
Repeated content and empty states were created through JavaScript rather than copied HTML.

---

## 8. Building connected search and filter controls

**Date:** October 22, 2026

**Student question:**  
How should search and category filtering work together?

**AI answer:**  
Read the current values of both controls whenever either one changes. Normalize the search text with `trim().toLowerCase()`. Filter the original data array using both conditions, render the filtered result, update the matching count, and show a no-results state when necessary. The reset button should restore every control and render the full list again.

**Project note:**  
Search and category selection were applied together instead of acting as unrelated filters.

---

## 9. Handling events correctly

**Date:** October 23, 2026

**Student question:**  
Which event types should we use for the required interactions?

**AI answer:**  
Use `submit` on forms so keyboard submission works, `click` for real buttons, and `input` or `change` for live search, counters, selections, and summaries. Register handlers with `addEventListener()` instead of inline `onclick` attributes. Call `event.preventDefault()` only when the default browser action must be stopped, such as during front-end form validation.

**Project note:**  
The project used `submit`, `click`, and an additional input-related event through `addEventListener()`.

---

## 10. Creating a calculation or selection flow

**Date:** October 23, 2026

**Student question:**  
How do we make a price or selection calculation reliable?

**AI answer:**  
Convert numeric input values with `Number()` and reject values that are missing, not finite, or outside the allowed range. Keep the calculation in a function that accepts values and returns the result. Update the summary after every relevant change and include the selected item, quantity or participants, unit price, and final total. Do not leave an old total visible after the input becomes invalid.

**Project note:**  
The calculation and the visible summary were refreshed whenever the related selection changed.

---

## 11. Planning form validation

**Date:** October 23, 2026

**Student question:**  
What is the correct order for validating a form with several fields?

**AI answer:**  
First clear outdated errors. Read and trim the values, then validate every field with a specific rule: required text, email or telephone format, a numeric/date/selection rule, and one rule that compares or combines fields. Show the message beside the related field, add an error class, and remember the first invalid field. If any rule fails, focus that first field. Only show the success summary after all rules pass.

**Project note:**  
Errors were displayed next to fields instead of using `alert()`.

---

## 12. Validating related fields and dates

**Date:** October 23, 2026

**Student question:**  
How can we validate two fields that depend on each other?

**AI answer:**  
Compare normalized values only after checking that both fields are individually valid. Examples include requiring the end date to be after the start date, requiring password confirmation to match exactly, or checking that participant count is allowed for the selected service. Show the comparison error beside the field the visitor needs to correct.

**Project note:**  
The form included a rule that combined or compared related inputs.

---

## 13. Safely displaying user input

**Date:** October 24, 2026

**Student question:**  
Can we use `innerHTML` to show a submitted name, review, or confirmation?

**AI answer:**  
Do not place user-provided text into `innerHTML`, because the browser may interpret it as HTML. Create elements and assign user input with `textContent`. This makes the content display as text and prevents injected markup from running. The same rule applies to reviews, names, notes, search text, and confirmation summaries.

**Project note:**  
User-provided values were inserted with `textContent`.

---

## 14. Completing a front-end-only submission

**Date:** October 24, 2026

**Student question:**  
What should the success message say if there is no server or database?

**AI answer:**  
Show a useful summary of the visitor’s choices, but state clearly that the interaction is a front-end demonstration. Do not claim that a real account, booking, payment, or order was created. A message such as “Demo request prepared; no data was sent to a server” is accurate and satisfies the requirement for clear feedback.

**Project note:**  
The final confirmation explains that no data is sent and no real transaction is created.

---

## 15. Debugging a feature that does not update

**Date:** October 24, 2026

**Student question:**  
A filter or summary works once but does not update after the next action. What should we check?

**AI answer:**  
Check the browser console first. Confirm that the element selectors find the intended elements, listeners are attached only after the document is available, and the handler reads the current values rather than old values captured earlier. Recalculate from the source data after every action. Also make sure generated elements receive listeners when they are created, or use event delegation on a stable parent container.

**Project note:**  
We checked console errors and retested repeated actions rather than testing only the initial state.

---

## 16. Testing before submission and defense

**Date:** October 24, 2026

**Student question:**  
What should we test before submitting Assignment 4-5?

**AI answer:**  
Test every feature in its initial, valid, invalid, empty, repeated-action, and final-confirmation states. Test keyboard access and widths around 375 px, 768 px, and desktop size. Verify that there are no console errors, dead buttons, unsafe user-input insertion, loose equality operators, or inline event attributes. Finally, trace one complete visitor journey from input through processing to the visible result so every team member can explain it during the defense.

**Project note:**  
The final review included functionality, validation, accessibility, responsive behavior, and defense preparation.

---

## Responsibility statement

AI suggestions were treated as guidance. The team selected the final approach, adapted it to the project, tested the behavior in the browser, and is able to explain the submitted JavaScript.
