const hebcal = require('hebcal');
console.log('Type of holidays:', typeof hebcal.holidays);
console.log('Holidays content:', hebcal.holidays);
// Try to see if HDate instance has a method for holidays
const d = new hebcal.HDate();
console.log('HDate instance keys:', Object.keys(d));
console.log('HDate prototype keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(d)));
