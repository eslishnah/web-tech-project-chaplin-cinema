# Dostar Cinema — Bootstrap Version

## Project

A frontend-only student website about Dostar Cinema in Astana, created for the Web Technologies course. The project started with HTML in Assignment 1 and custom CSS in Assignment 2. The current Assignment 3 version uses Bootstrap 5.3.3 on all eight pages.

## Pages and team

| Author | Pages | Content |
|---|---|---|
| Daniyar | `index.html`, `movies.html`, `schedule.html` | Home, movie information, sample schedule and booking form |
| Sandzhar | `cinema.html`, `halls.html`, `colophon.html` | Cinema information, halls and feedback, project description |
| Nauryzbay | `visit.html`, `services.html` | Visiting information, services and feedback |

## Run locally

1. Download or clone the repository.
2. Open `index.html` in a browser.
3. Use the navigation menu to explore the pages.

No build step, package installation, backend or database is required. Internet access is required to load Bootstrap CSS and its JavaScript bundle from jsDelivr. The bundle powers the collapsible mobile navigation; there is no custom JavaScript.

## Forms and sample content

The booking and feedback forms demonstrate frontend layout and native browser validation using labels, fieldsets, input types and attributes such as `required` and `min`. They use `method="post" action="#"` as placeholders and have no submission handler. They do not create bookings, deliver feedback or store data in a database. Backend processing is outside the scope of this project.

The schedule and hall tables contain example data, not a live cinema feed.

## Styling

Every page loads Bootstrap 5.3.3 CSS followed by `css/base.css`, and includes the Bootstrap JavaScript bundle. Layout and components use containers, responsive rows and columns, navigation, cards, tables, forms, buttons and utility classes.

The shared `css/base.css` contains the small custom styling layer:

- Bootstrap theme variables for colours, body background, text and font.
- Georgia headings and navbar branding.
- A 4:3 aspect ratio and cover cropping for card images.
- Wrapping for preformatted text.
- Small green/orange section accents, form focus styling and future JavaScript state classes.

Green, orange, dark and light tones are inspired by the cinema interior. The variable overrides do not retheme every Bootstrap component; some component colours retain Bootstrap defaults.

There is one shared custom stylesheet: `css/base.css`. Bootstrap handles the layout and components; `base.css` contains only the shared brand corrections and prepared UI states.

## Repository structure

```text
project/
├── index.html
├── movies.html
├── schedule.html
├── cinema.html
├── halls.html
├── visit.html
├── services.html
├── colophon.html
├── css/
│   └── base.css
├── images/             (local cinema photos)
├── README.md
├── CSS_CHECKLIST.md
├── BOOTSTRAP_MIGRATION.md
└── AI_LOG_Assignment_3.md
```

## Documentation

- [CSS and Bootstrap checklist](CSS_CHECKLIST.md): current implementation examples and source line references.
- [Bootstrap migration](BOOTSTRAP_MIGRATION.md): overview of the layout and component migration.
- [Assignment 3 AI log](AI_LOG_Assignment_3.md): how AI supported the work.

## Checks before submission

These are manual checks to perform, not a record of completed validation:

- Validate HTML and custom CSS with the W3C validators.
- Inspect every page at 375 px, 768 px and desktop widths.
- Check mobile navigation, internal links and image loading.
- Check field labels, native required-field validation and reset buttons; real form delivery is outside scope.
- Capture the required `movies.html` screenshots.
- Recheck checklist line references after editing source files.
