import moment from 'moment';
import { randAccount, randBetweenDate, randNumber, randCompanyName, randFullName } from '@ngneat/falso';
import { selectRandValue, getDates, generateRandomBankName } from './helpers/functions.js'
import { SUBSET_COUNTRIES, SUBSET_CURRENCIES, BANKING_PRODUCT_TYPES } from './helpers/sampleDataLists.js'
import generateCsv from './helpers/generateCsv.js';


// VARIABLES
const numberAccounts = 10 // How many different accounts you want to generate transactional data for
const accountLength = 12 // The length of numbers for the account number
const numberEntities = 4 // An entity can have many accounts, this is used to define how many entities own the number of accounts generated
const fromDate = '2022-09-01' // YYYY-MM-DD - when to start generating transaction data from
const toDate = '2022-12-31' // YYYY-MM-DD - when to stop generating transaction data to
const outputDatetimeFormat = 'YYYY-MM-DD HH:mm:ss' // format of datetime for output csv's
const outputDateFormat = 'YYYY-MM-DD' // format of date for output csv's

// Error Handling for variables
if (numberEntities > numberAccounts) { throw new Error('numberEntities should be less than numberAccounts') }
if (accountLength <= 6) { throw new Error('accountLength should not be less than 6 digits') }
if (moment(toDate) <= moment(fromDate)) { throw new Error('toDate must be a date greater than fromDate') }


// GENERATE ARRAY OF DATES FOR SPECIFIED DATE RANGE
const dates = getDates(fromDate, toDate)


// GENERATE ROW DATA FOR ACCOUNT BALANCES TABLE
let accountBalancesTable = [];

const accountNosList = randAccount({ length: numberAccounts, accountLength });

const listEntities = randCompanyName({ length: numberEntities })

// Create account balance row for each account number for all dates
accountNosList.forEach((accountNo) => {
  const baseAccounBalRow = {
    'Account Number': accountNo,
    'Location': selectRandValue(SUBSET_COUNTRIES),
    'Date': null,
    'Account Currency': selectRandValue(SUBSET_CURRENCIES),
    'Product Type': selectRandValue(BANKING_PRODUCT_TYPES),
    'Financial Institution': generateRandomBankName(),
    'Account Currency Balance': null,
    'Entity': selectRandValue(listEntities),
  }
  dates.forEach((date, index) => {
    const dailyAccountBalRow = {
      ...baseAccounBalRow,
      'Date': date.format(outputDateFormat),
      'Account Currency Balance': index === 0 ? randNumber({ min: 10000, max: 10000000, precision: 1000 }) : 0 // Set opening balance for earliest date (assuming index 0 is earliest date)
    }
    accountBalancesTable.push(dailyAccountBalRow)
  })
})


// GENERATE ROW DATA FOR TRANSACTIONS TABLE
let transactionsTable = []

accountNosList.forEach((accountNo) => {
  let prevDayAccBalObject
  dates.forEach((date, index) => {
    // Generating random number of transactions for a specific account number
    const noTransactions = randNumber({ min: 0, max: 20 })
    const transactionAmounts = randNumber({ length: noTransactions, min: -100000, max: 100000, fraction: 2 })

    // Updating the balance in the Account Balances list so it adds up.
    const sumTransactions = transactionAmounts.reduce((prevValue, nextValue) => Number(prevValue) + Number(nextValue), [0])


    let currentDayAccBalObject = accountBalancesTable.find((accBalObject) => {
      return accountNo === accBalObject['Account Number'] && date.format(outputDateFormat) === accBalObject.Date
    })

    // If current is earliest date i.e. fromDate, then currentDayAccBalObject = the starting balance value of the account.
    if (index === 0) {
      prevDayAccBalObject = { ...currentDayAccBalObject }
    } else {
      currentDayAccBalObject['Account Currency Balance'] = Number(prevDayAccBalObject['Account Currency Balance']) + sumTransactions
      prevDayAccBalObject = { ...currentDayAccBalObject }
    }

    // Restricting random times to within 9am - 6pm
    const startDateTime = date.clone().hours(9).format()
    const endDateTime = date.clone().hours(18).format()

    // Creating each transaction row based off the amounts
    transactionAmounts.forEach((amount) => {
      const transactionType = selectRandValue(['Internal Transfer', 'Cross Border Transfer', 'Direct Debit', 'Cheque'])
      const transactionRow = {
        'Account Number': accountNo,
        'Datetime': moment(randBetweenDate({ from: new Date(startDateTime), to: new Date(endDateTime) })).format(outputDatetimeFormat),
        'Transaction type': transactionType,
        'Inflows / Outflows': amount < 0 ? 'Outflow' : 'Inflow',
        'Transaction Amount in Account Currency': amount,
        'Counterparty': randFullName()

      }
      transactionsTable.push(transactionRow)
    })
  })
})


// GENERATE ROW DATA FOR TERM DEPOSIT TABLE
let noExistingTD = 2 // how many term deposits that have started before fromDate
let noStartingTD = 2 // how many term deposits that have started after fromDate & before toDate
let noMaturingTD = 1 // how many term deposits that will mature during fromDate & toDate within existing & starting

// Error Handling for variables
if (noMaturingTD > noExistingTD) { throw new Error('Cannot calculate Term Deposit, noMaturingTD is greater than noExistingTD') }
if (noMaturingTD > noStartingTD) { throw new Error('Cannot calculate Term Deposit, noMaturingTD is greater than noStartingTD') }

let termDepositTable = []

// Create unique Account Numbers for total number of term deposits
const existingTDAccounts = randAccount({ length: noExistingTD, accountLength });
const startingTDAccounts = randAccount({ length: noStartingTD, accountLength });

const calcBaseTemplate = (argObj) => {
  const { placementDate, maturityDate, accountNo } = argObj
  return {
    'Account Number': accountNo,
    'Location': selectRandValue(SUBSET_COUNTRIES),
    'Date': null, // Current date of balance
    'Account Currency': selectRandValue(SUBSET_CURRENCIES),
    'Product Type': 'Term Deposit',
    'Financial Institution': generateRandomBankName(),
    'Account Currency Balance': 0,
    'Account Currency Interest Amount': 0,
    'Entity': selectRandValue(listEntities),
    'Interest Rate (%)': 0, // Annual Interest rate 
    'Placement Date': placementDate.format(outputDateFormat), // Date when term deposit began for existing needs to be before fromDate
    'Maturity Date': maturityDate.format(outputDateFormat), // Date when term deposit ends and initial sum is returned
    'Tenor Days': '', // Date (so current date) - Placement Date (Date when term deposit began)
    'Days to Maturity': '', // How many days from (current) Date to Maturity Date
  }
}

const calculateInterest = (argObj) => {
  const { accCurrBalance, interestRate, tenorDays } = argObj
  const annualInterest = accCurrBalance * (interestRate / 100) // How much interest is for Annual period
  const percentYear = tenorDays / 365 // What percent of a year the tenorDays is
  return annualInterest * percentYear
}

// Allocate to each accountNumber whether it will be existing or starting
let counter = noMaturingTD
existingTDAccounts.forEach((accountNo) => {
  // Create Placement Date prior to fromDate from some random number of days before fromDate
  const placementDate = moment(fromDate).subtract(randNumber({ min: 1, max: 100 }), 'd')
  // By default set maturity date to some random number of days after toDate
  let maturityDate = moment(toDate).add(randNumber({ min: 1, max: 100 }), 'd')
  // If noMaturingTD > 0 then select a maturity date between fromDate & toDate
  if (counter > 0) {
    const noDaysBetweenFromToDate = moment(toDate).diff(fromDate, 'days')
    maturityDate = moment(fromDate).add(randNumber({ min: 1, max: noDaysBetweenFromToDate }), 'd')
    counter -= 1
  }

  const baseTDAccBalRow = calcBaseTemplate({ placementDate, maturityDate, accountNo })
  const interestRate = randNumber({ min: 1, max: 10, fraction: 2 })
  const accCurrBalance = randNumber({ min: 10000, max: 10000000, precision: 1000 })
  dates.forEach((date) => {
    const daysToMaturity = moment(maturityDate).diff(date, 'days');
    const tenorDays = moment(date).diff(placementDate, 'days')
    // If it's already matured/hasn't started yet don't add row
    if (daysToMaturity < 0 || tenorDays < 0) { return }
    const dailyTDAccBalRow = {
      ...baseTDAccBalRow,
      'Date': date.format(outputDateFormat),
      'Tenor Days': tenorDays, // Date (so current date) - Placement Date (Date when term deposit began)
      'Days to Maturity': daysToMaturity,
      'Interest Rate (%)': interestRate, // Annual Interest rate
      'Account Currency Balance': daysToMaturity === 0 ? 0 : accCurrBalance,
      'Account Currency Interest Amount': daysToMaturity === 0 ? calculateInterest({ accCurrBalance, interestRate, tenorDays }): 0,
    }
    termDepositTable.push(dailyTDAccBalRow)
  })
})

let counter2 = noMaturingTD
startingTDAccounts.forEach((accountNo) => {
  // Create Placement Date between fromDate and toDate
  const noDaysBetweenFromToDate = moment(toDate).diff(fromDate, 'days')
  const placementDate = moment(fromDate).add(randNumber({ min: 1, max: noDaysBetweenFromToDate }), 'd')
  // By default set maturity date to some random number of days after toDate
  let maturityDate = moment(toDate).add(randNumber({ min: 1, max: 100 }), 'd')
  // If noMaturingTD > 0 then select a maturity date between fromDate & toDate
  if (counter2 > 0) {
    const diffBetweenPlacementToDate = moment(toDate).diff(placementDate, 'days')
    maturityDate = moment(fromDate).add(randNumber({ min: 1, max: diffBetweenPlacementToDate }), 'd')
    counter2 -= 1
  }

  const baseTDAccBalRow = calcBaseTemplate({ placementDate, maturityDate, accountNo })
  const interestRate = randNumber({ min: 0.1, max: 10, fraction: 2 })
  const accCurrBalance = randNumber({ min: 10000, max: 10000000, precision: 1000 })
  dates.forEach((date) => {
    const daysToMaturity = moment(maturityDate).diff(date, 'days');
    const tenorDays = moment(date).diff(placementDate, 'days')
    // If it's already matured/hasn't started yet don't add row
    if (daysToMaturity < 0 || tenorDays < 0) { return }
    const dailyTDAccBalRow = {
      ...baseTDAccBalRow,
      'Date': date.format(outputDateFormat),
      'Tenor Days': tenorDays, // Date (so current date) - Placement Date (Date when term deposit began)
      'Days to Maturity': daysToMaturity,
      'Interest Rate (%)': interestRate, // Annual Interest rate
      'Account Currency Balance': daysToMaturity === 0 ? 0 : accCurrBalance,
      'Account Currency Interest Amount': daysToMaturity === 0 ? calculateInterest({ accCurrBalance, interestRate, tenorDays }): 0,
    }
    termDepositTable.push(dailyTDAccBalRow)
  })
})

// GENERATE ROW DATA FOR TERM DEPOSITS TRANSACTIONS



// WRITE ACCOUNT BALANCES TABLE TO CSV
generateCsv(
  accountBalancesTable,
  'output/account_balances.csv',
  [
    { id: 'Account Number', title: 'Account Number' },
    { id: 'Location', title: 'Location' },
    { id: 'Date', title: 'Date' },
    { id: 'Account Currency', title: 'Account Currency' },
    { id: 'Product Type', title: 'Product Type' },
    { id: 'Financial Institution', title: 'Financial Institution' },
    { id: 'Account Currency Balance', title: 'Account Currency Balance' },
    { id: 'Entity', title: 'Entity' },
  ]
)

// WRITE TRANSACTIONS TABLE TO CSV
generateCsv(
  transactionsTable,
  'output/transactions.csv',
  [
    { id: 'Account Number', title: 'Account Number' },
    { id: 'Datetime', title: 'Datetime' },
    { id: 'Transaction type', title: 'Transaction type' },
    { id: 'Inflows / Outflows', title: 'Inflows / Outflows' },
    { id: 'Transaction Amount in Account Currency', title: 'Transaction Amount in Account Currency' },
    { id: 'Counterparty', title: 'Counterparty' },
  ]
)

// WRITE TERM DEPOSIT TABLE TO CSV
generateCsv(
  termDepositTable,
  'output/term_deposit.csv',
  [
    { id: 'Account Number', title: 'Account Number' },
    { id: 'Location', title: 'Location' },
    { id: 'Date', title: 'Date' },
    { id: 'Account Currency', title: 'Account Currency' },
    { id: 'Product Type', title: 'Product Type' },
    { id: 'Financial Institution', title: 'Financial Institution' },
    { id: 'Account Currency Balance', title: 'Account Currency Balance' },
    { id: 'Account Currency Interest Amount', title: 'Account Currency Interest Amount' },
    { id: 'Entity', title: 'Entity' },
    { id: 'Interest Rate (%)', title: 'Interest Rate (%)' },
    { id: 'Placement Date', title: 'Placement Date' },
    { id: 'Maturity Date', title: 'Maturity Date' },
    { id: 'Tenor Days', title: 'Tenor Days' },
    { id: 'Days to Maturity', title: 'Days to Maturity' },
  ]
)
