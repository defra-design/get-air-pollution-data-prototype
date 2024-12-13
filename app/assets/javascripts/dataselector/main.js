//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
});

// Update hint text with year of availability for specific pollutants
const hintTextMap = {
  pm2_5: "Data available for PM2.5 from 1 January 1976",
  pm10: "Data available for PM10 from 1 January 1976",
  no2: "Data available for nitrogen dioxide from 1 July 1972",
  ozone: "Data available for ozone from 1 January 1985",
  so2: "Data available for sulphur dioxide from 1 January 1980",
  "other-p": "Data available from 1984",
};

// Function to update hint text
const updateHintText = () => {
  const selectedRadio = document.querySelector('input[name="contact"]:checked');
  const hintTextElement = document.getElementById("start-year");

  if (selectedRadio && hintTextMap[selectedRadio.value]) {
    hintTextElement.textContent = hintTextMap[selectedRadio.value];
  }
};

// Attach event listeners to all radio buttons
document.querySelectorAll('input[name="contact"]').forEach((radio) => {
  radio.addEventListener("change", updateHintText);
});