const hebcal = require('hebcal');
const d = new hebcal.HDate();
console.log('Holidays for today:', d.holidays());
// Try a known holiday date (e.g. 1st of Tishrei)
const roshHashana = new hebcal.HDate(new Date(2025, 8, 23)); // approx Sept 2025
console.log('Rosh Hashana date:', roshHashana.toString());
console.log('Holidays for Rosh Hashana:', roshHashana.holidays());
