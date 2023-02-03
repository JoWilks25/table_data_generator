import moment from 'moment';
import { randBetweenDate, randNumber } from '@ngneat/falso';

// FUNCTIONS
export const generateRandDate = (fromDateString, toDateString) => randBetweenDate({ from: new Date(fromDateString), to: new Date(toDateString) })
export const selectRandValue = (array) => array[Math.floor(Math.random() * array.length)];
export const generateRandomBankName = () => `Bank of ${randNumber({ min: 1, max: 20 })}`

// Returns an array of dates between the two dates
export const getDates = (fromDate, toDate) => {
  const result = []
  let day = moment(fromDate)
  while (day <= moment(toDate)) {
    result.push(day)
    day = day.clone().add(1, 'd')
  }
  return result
}