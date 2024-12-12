import accessibleAutocomplete from 'accessible-autocomplete';

document.addEventListener('DOMContentLoaded', () => {
  accessibleAutocomplete({
    element: document.querySelector('#autocomplete-container-p'),
    id: 'my-autocomplete',
    source: [
      // Pollutants
      'Particulate calcium',
      'Particulate chloride',
      'Particulate magnesium',
      'Particulate sodium',
      'Particulate nitrite',
      'Particulate nitrate',
      'Particulate sulphate',
      'Gaseous nitric acid',
      'Gaseous nitrous acid',
      'Gaseous sulphur dioxide',
      'Ethane',
      'Ethene',
      'Ethyne',
      'Propane',
      'Propene',
      'Iso-butane',
      'N-butane',
      '1-butene',
      'Trans-2-butene',
      'Cis-2-butene',
      'Iso-pentane',
      'N-pentane',
      '1,3-butadiene',
      'Trans-2-pentene',
      '1-pentene',
      '2-methylpentane',
      'Isoprene',
      'N-hexane',
      'N-heptane',
      'Iso-octane',
      'N-octane',
      'Benzene',
      'Toluene',
      'Ethylbenzene',
      'M+p-xylene',
      'O-xylene',
      '1,2,3-trimethylbenzene',
      '1,2,4-trimethylbenzene',
      '1,3,5-trimethylbenzene',
      'Nitrogen oxides as nitrogen dioxide',
      'Nitric oxide',
      'Arsenic',
      'Cadmium',
      'Chromium',
      'Cobalt',
      'Copper',
      'Iron',
      'Lead',
      'Manganese',
      'Nickel',
      'Selenium',
      'Vanadium',
      'Zinc',
      'Aluminium in precipitation',
      'Antinomy in precipitation',
      'Arsenic in precipitation',
      'Barium in precipitation',
      'Beryllium in precipitation',
      'Cadmium in precipitation',
      'Caesium in precipitation',
      'Chromium in precipitation',
      'Cobalt in precipitation',
      'Copper in precipitation',
      'Iron in precipitation',
      'Lead in precipitation',
      'Lithium in precipitation',
      'Manganese in precipitation',
      'Mercury in precipitation',
      'Molybdenum in precipitation',
      'Nickel in precipitation',
      'Rubidium in precipitation',
      'Selenium in precipitation',
      'Strontium in precipitation',
      'Tin in precipitation',
      'Titanium in precipitation',
      'Tungsten in precipitation',
      'Uranium in precipitation',
      'Vanadium in precipitation',
      'Zinc in precipitation',
      'Calcium in PM10',
      'Chloride in PM10',
      'Potassium in PM10',
      'Magnesium in PM10',
      'Sodium in PM10',
      'Ammonium in PM10',
      'Nitrate in PM10',
      'Sulphate in PM10',
      'Calcium in PM2.5',
      'Chloride in PM2.5',
      'Potassium in PM2.5',
      'Magnesium in PM2.5',
      'Sodium in PM2.5',
      'Ammonium in PM2.5',
      'Nitrate in PM2.5',
      'Sulphate in PM2.5',
      'Gaseous hydrochloric acid',
      'Gaseous nitrous acid',
      'Gaseous nitric acid',
      'Gaseous ammonia',
      'Gaseous sulphur dioxide',
      'Benzo(a)pyrene',
      'Benzo(a)anthracene',
      'Benzo(b)fluoranthene',
      'Benzo(j)fluoranthene',
      'Benzo(b+j)fluoranthene',
      'Benzo(k)fluoranthene',
      'Indeno(1,2,3-cd)pyrene',
      'Dibenzo(ac)anthracene',
      'Dibenzo(ah)anthracene',
      'Dibenzo(ah+ac)anthracene',
      '1-Methyl anthracene',
      '1-Methyl Naphthalene',
      '1-Methyl phenanthrene',
      '2-Methyl anthracene',
      '2-Methyl Naphthalene',
      '2-Methyl phenanthrene',
      '4.5-Methylene phenanthrene',
      '5-Methyl Chrysene',
      '9-Methyl anthracene'
      
    ],
  });
});
