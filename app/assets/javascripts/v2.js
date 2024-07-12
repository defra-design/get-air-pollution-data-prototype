//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
  // Add JavaScript here
})
/* 
new MOJFrontend.FilterToggleButton({
  bigModeMediaQuery: "(min-width: 48.063em)",
  startHidden: false,
  toggleButton: {
    container: document.querySelector(".moj-action-bar__filter"),
    showText: "Show filters",
    hideText: "Hide filters",
    classes: "govuk-button--secondary",
  },
  closeButton: {
    container: document.querySelector(".moj-filter__header-action"),
    text: "Close",
  },
  filter: {
    container: document.querySelector(".moj-filter"),
  },
}); */

// search 

document.addEventListener("DOMContentLoaded", function() {
  // Select the form element
  const form = document.querySelector('form');
  const searchInput = document.getElementById('search');

  form.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent the form from submitting the default way
      const query = searchInput.value.trim().toLowerCase(); // Get the input value and convert to lower case

      if (query === 'birmingham') {
          // Redirect to the specified page if the query matches 'birmingham'
          window.location.href = '/version-2/results-birmingham.html';
      } else if (query === 'b24qa' || 'b2 4qa' || 'b2') {
        // Redirect to the specified page if the query matches 'birmingham'
        window.location.href = '/version-2/results-b2-4qa.html';
    }

      else {
        // Otherwise, submit the form normally or handle other search logic here
        form.submit();
    }
  });
});
