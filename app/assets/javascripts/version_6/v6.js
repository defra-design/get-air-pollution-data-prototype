//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
});

document.addEventListener("DOMContentLoaded", function() {
  // Select the form element
  const form = document.querySelector('form');
  const searchInput = document.getElementById('search');

  form.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent the form from submitting the default way
      const query = searchInput.value.trim().toLowerCase(); // Get the input value and convert to lower case

      if (query === 'b24qa' || 'b2 4qa' || 'b2') {
        // Redirect to the specified page if the query matches 'birmingham'
        window.location.href = '/version-6_1/results-b2-4qa.html';
    }

      else {
        // Otherwise, submit the form normally or handle other search logic here
        form.submit();
    }
  });
});

// for deeplink from pollutant table to specific pollutant when there is an exceedence
$(document).ready(function() {
  $(window).scrollTop(0); // Scroll to the top of the page
});