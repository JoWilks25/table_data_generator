import { randBetweenDate, randNumber } from '@ngneat/falso';

// FUNCTIONS
export const generateRandDate = (fromDateString, toDateString) => randBetweenDate({ from: new Date(fromDateString), to: new Date(toDateString) })
export const selectRandValue = (array) => array[Math.floor(Math.random() * array.length)];
export const generateRandomBankName = () => `Bank of ${randNumber({ min: 1, max: 20 })}`

// Returns an array of dates between the two dates
export function getDates (startDate, endDate) {
  const dates = []
  let currentDate = startDate
  const addDays = function (days) {
    const date = new Date(this.valueOf())
    date.setDate(date.getDate() + days)
    return date
  }
  while (currentDate <= endDate) {
    dates.push(currentDate)
    currentDate = addDays.call(currentDate, 1)
  }
  return dates
}