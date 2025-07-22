//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//
/* 
document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.querySelector('button.govuk-button--secondary');
  const submitButton = document.querySelector('button.govuk-button:not(.govuk-button--secondary)');
  const table = document.getElementById('pollutant-table');
  const tableBody = table.querySelector('tbody');
  let count = 0;

  // 1. Restore any previously stored pollutants
  const stored = sessionStorage.getItem('selectedPollutants');
  if (stored) {
    const pollutants = JSON.parse(stored);

    pollutants.forEach((value) => {
      count++;

      const row = document.createElement('tr');
      row.className = 'govuk-table__row';

      const headerCell = document.createElement('th');
      headerCell.scope = 'row';
      headerCell.className = 'govuk-table__header';
      headerCell.textContent = `Pollutant ${count}`;

      const valueCell = document.createElement('td');
      valueCell.className = 'govuk-table__cell';
      valueCell.textContent = value;

      const actionCell = document.createElement('td');
      actionCell.className = 'govuk-table__cell';

      const removeLink = document.createElement('a');
      removeLink.href = '#';
      removeLink.className = 'govuk-link';
      removeLink.textContent = 'Remove';

      removeLink.addEventListener('click', function (e) {
        e.preventDefault();
        row.remove();
        if (tableBody.children.length === 0) {
          table.hidden = true;
          count = 0;
        }
      });

      actionCell.appendChild(removeLink);
      row.appendChild(headerCell);
      row.appendChild(valueCell);
      row.appendChild(actionCell);
      tableBody.appendChild(row);

      table.hidden = false;
    });
  }

  // 2. Add new pollutant to table
  addButton.addEventListener('click', function (e) {
    e.preventDefault();

    const input = document.querySelector('#my-autocomplete');
    if (!input) return;

    const value = input.value.trim();
    if (!value) {
      alert('Please select a pollutant.');
      return;
    }

    count++;
    if (table.hidden) table.hidden = false;

    const row = document.createElement('tr');
    row.className = 'govuk-table__row';

    const headerCell = document.createElement('th');
    headerCell.scope = 'row';
    headerCell.className = 'govuk-table__header';
    headerCell.textContent = `Pollutant ${count}`;

    const valueCell = document.createElement('td');
    valueCell.className = 'govuk-table__cell';
    valueCell.textContent = value;

    const actionCell = document.createElement('td');
    actionCell.className = 'govuk-table__cell';

    const removeLink = document.createElement('a');
    removeLink.href = '#';
    removeLink.className = 'govuk-link';
    removeLink.textContent = 'Remove';

    removeLink.addEventListener('click', function (e) {
      e.preventDefault();
      row.remove();
      if (tableBody.children.length === 0) {
        table.hidden = true;
        count = 0;
      }
    });

    actionCell.appendChild(removeLink);
    row.appendChild(headerCell);
    row.appendChild(valueCell);
    row.appendChild(actionCell);
    tableBody.appendChild(row);

    input.value = '';
  });

  // 3. Submit and save to sessionStorage
  submitButton.addEventListener('click', function (e) {
    e.preventDefault();

    let pollutants = [];

    if (!table.hidden && tableBody.children.length > 0) {
      const rows = tableBody.querySelectorAll('tr');
      rows.forEach(row => {
        const name = row.querySelector('td').textContent.trim();
        pollutants.push(name);
      });
    } else {
      const input = document.querySelector('#my-autocomplete');
      if (input && input.value.trim()) {
        pollutants.push(input.value.trim());
      }
    }

    if (pollutants.length === 0) {
      alert('Please select at least one pollutant.');
      return;
    }

    sessionStorage.setItem('selectedPollutants', JSON.stringify(pollutants));
    window.location.href = 'create-pollutant.html';
  });
});
 */

document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.querySelector('button.govuk-button--secondary');
  const submitButton = document.querySelector('button.govuk-button:not(.govuk-button--secondary)');
  const table = document.getElementById('pollutant-table');
  const tableBody = table.querySelector('tbody');
  let count = 0;
  const addedPollutants = new Set(); // Track unique values

  // 1. Restore any previously stored pollutants
  const stored = sessionStorage.getItem('selectedPollutants');
  if (stored) {
    const pollutants = JSON.parse(stored);

    pollutants.forEach((value) => {
      count++;
      addedPollutants.add(value.toLowerCase()); // Add to tracking set

      const row = document.createElement('tr');
      row.className = 'govuk-table__row';

      const headerCell = document.createElement('th');
      headerCell.scope = 'row';
      headerCell.className = 'govuk-table__header';
      headerCell.textContent = `Pollutant ${count}`;

      const valueCell = document.createElement('td');
      valueCell.className = 'govuk-table__cell';
      valueCell.textContent = value;

      const actionCell = document.createElement('td');
      actionCell.className = 'govuk-table__cell';

      const removeLink = document.createElement('a');
      removeLink.href = '#';
      removeLink.className = 'govuk-link';
      removeLink.textContent = 'Remove';

      removeLink.addEventListener('click', function (e) {
        e.preventDefault();
        row.remove();
        addedPollutants.delete(value.toLowerCase()); // Remove from set
        if (tableBody.children.length === 0) {
          table.hidden = true;
          count = 0;
        }
      });

      actionCell.appendChild(removeLink);
      row.appendChild(headerCell);
      row.appendChild(valueCell);
      row.appendChild(actionCell);
      tableBody.appendChild(row);

      table.hidden = false;
    });
  }

  // 2. Add new pollutant with duplicate check
  addButton.addEventListener('click', function (e) {
    e.preventDefault();

    const input = document.querySelector('#my-autocomplete');
    if (!input) return;

    const value = input.value.trim();
    if (!value) {
      alert('Please select a pollutant.');
      return;
    }

    const lowerValue = value.toLowerCase();
    if (addedPollutants.has(lowerValue)) {
      // Show the GOV.UK error summary
      const errorSummary = document.getElementById('duplicate-error');
      if (errorSummary) {
        errorSummary.hidden = false;
        errorSummary.focus();
        errorSummary.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    count++;
    addedPollutants.add(lowerValue);

    if (table.hidden) table.hidden = false;

    const row = document.createElement('tr');
    row.className = 'govuk-table__row';

    const headerCell = document.createElement('th');
    headerCell.scope = 'row';
    headerCell.className = 'govuk-table__header';
    headerCell.textContent = `Pollutant ${count}`;

    const valueCell = document.createElement('td');
    valueCell.className = 'govuk-table__cell';
    valueCell.textContent = value;

    const actionCell = document.createElement('td');
    actionCell.className = 'govuk-table__cell';

    const removeLink = document.createElement('a');
    removeLink.href = '#';
    removeLink.className = 'govuk-link';
    removeLink.textContent = 'Remove';

    removeLink.addEventListener('click', function (e) {
      e.preventDefault();
      row.remove();
      addedPollutants.delete(lowerValue);
      if (tableBody.children.length === 0) {
        table.hidden = true;
        count = 0;
      }
    });

    actionCell.appendChild(removeLink);
    row.appendChild(headerCell);
    row.appendChild(valueCell);
    row.appendChild(actionCell);
    tableBody.appendChild(row);

    input.value = '';
    // Hide the error summary if it's visible
    const errorSummary = document.getElementById('duplicate-error');
    if (errorSummary) {
      errorSummary.hidden = true;
    }

  });

  // 3. Submit and save to sessionStorage
  submitButton.addEventListener('click', function (e) {
    e.preventDefault();

    let pollutants = [];

    if (!table.hidden && tableBody.children.length > 0) {
      const rows = tableBody.querySelectorAll('tr');
      rows.forEach(row => {
        const name = row.querySelector('td').textContent.trim();
        pollutants.push(name);
      });
    } else {
      const input = document.querySelector('#my-autocomplete');
      if (input && input.value.trim()) {
        const value = input.value.trim();
        if (addedPollutants.has(value.toLowerCase())) {
          // Already in the table — no need to duplicate
          pollutants = Array.from(addedPollutants);
        } else {
          pollutants.push(value);
        }
      }
    }

    if (pollutants.length === 0) {
      alert('Please select at least one pollutant.');
      return;
    }

    sessionStorage.setItem('selectedPollutants', JSON.stringify(pollutants));
    window.location.href = 'create-pollutant.html';
  });
});
