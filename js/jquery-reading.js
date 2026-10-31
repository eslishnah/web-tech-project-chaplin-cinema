'use strict';

// jQuery 3.7.1 applies the stored reading preference consistently on every page.
const CinemaReading = {
  apply(large) { $('html').toggleClass('fs-4', large); }
};

$(function () {
  CinemaReading.apply(CinemaUI.readStorage('dostar-large-text', false) === true);
});
