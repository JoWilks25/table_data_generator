import moment from 'moment';
import { randAccount, randBetweenDate, randNumber, randCompanyName, randFullName } from '@ngneat/falso';
import { selectRandValue, getDates, generateRandomBankName } from './helpers/functions.js'
import { SUBSET_COUNTRIES, SUBSET_CURRENCIES, BANKING_PRODUCT_TYPES } from './helpers/sampleDataLists.js'
import generateCsv from './helpers/generateCsv.js';


// VARIABLES
const numberAccounts = 10 // How many different accounts you want to generate transactional data for
const accountLength = 12 // The length of numbers for the account number
const numberEntities = 4 // An entity can have many accounts, this is used to define how many entities own the number of accounts generated
const fromDate = '2022-12-28' // YYYY-MM-DD - when to start generating transaction data from
const toDate = '2022-12-31' // YYYY-MM-DD - when to stop generating transaction data to
const outputDatetimeFormat = 'YYYY-MM-DD HH:mm:ss' // format of datetime for output csv's
const outputDateFormat = 'YYYY-MM-DD' // format of date for output csv's

// GENERATE ARRAY OF DATES FOR SPECIFIED DATE RANGE
const dates = getDates(fromDate, toDate)

// GENERATE ROW DATA FOR ACCOUNT BALANCES TABLE
let accountBalancesTable = [];

const accountNosList = randAccount({ length: numberAccounts, accountLength });

const listEntities = randCompanyName({ length: numberEntities })

// Create account balance row for each account number for all dates
accountNosList.forEach((accountNumber) => {
  const baseAccounBalRow = {
    'Account Number': accountNumber,
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

accountNosList.forEach((accountNumber) => {
  let prevDayAccBalObject
  dates.forEach((date, index) => {
    // Generating random number of transactions for a specific account number
    const noTransactions = randNumber({ min: 0, max: 20 })
    const transactionAmounts = randNumber({ length: noTransactions, min: -100000, max: 100000, fraction: 2 })

    // Updating the balance in the Account Balances list so it adds up.
    const sumTransactions = transactionAmounts.reduce((prevValue, nextValue) => Number(prevValue) + Number(nextValue), [0])


    let currentDayAccBalObject = accountBalancesTable.find((accBalObject) => {
      return accountNumber === accBalObject['Account Number'] && date.format(outputDateFormat) === accBalObject.Date
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
        'Account Number': accountNumber,
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
let termDepositTable = [];



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
