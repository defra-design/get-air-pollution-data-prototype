import accessibleAutocomplete from 'accessible-autocomplete';

document.addEventListener('DOMContentLoaded', () => {
  const POLLUTANT_SOURCE = [
    
    // Core gases with symbols
    'Carbon monoxide (CO)',
    'Ozone (O3)',
    'Sulphur dioxide (SO2)',
    'Particulate matter (PM10)',
    'Fine particulate matter (PM2.5)',
    // NOx family
    'Nitrogen dioxide (NO2)',
    'Nitrogen oxides as nitrogen dioxide (NOx as NO2)',
    'Nitric oxide (NO)',

    // Aganet (SO2 in list above)
    'Particulate calcium (Ca)',
    'Particulate chloride (Cl)',
    'Particulate magnesium (Mg)',
    'Particulate sodium (Na)',
    'Particulate nitrite',
    'Particulate nitrate (NO3)',
    'Particulate sulphate (SO4)',
     // Acid gases
    'Hydrochloric acid (HCl)',
    'Nitrous acid (HNO2)',
    'Nitric acid (HNO3)',

  
  ];

  accessibleAutocomplete({
    element: document.querySelector('#autocomplete-container-p'),
    id: 'my-autocomplete',
    source: POLLUTANT_SOURCE
  });
});
