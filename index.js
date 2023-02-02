import { randAccount, randCountry, randNumber, randCompanyName, randFullName, randCurrencyCode } from '@ngneat/falso';
import { generateRandDate, selectRandValue, getDates } from './functions.js'
import ALL_CURRENCIES from './standardDataLists/currencies.js';
import {SUBSET_COUNTRIES, SUBSET_CURRENCIES, BANKING_PRODUCT_TYPES} from './standardDataLists/subsets.js'

// VARIABLES
const numberAccounts = 10
const accountLength = 12
const setLocation = 'United Kingdom'
const fromDate = '01/12/2022'
const toDate = '12/31/2022'
const currentDate = '01/01/2022'
const setCurrency = 'GBP'

// GENERATE ARRAY OF DATES FOR SPECIFIED DATE RANGE
const dates = getDates(new Date(fromDate), new Date(toDate))

console.log('dates', dates)

// GENERATE ROW DATA FOR ACCOUNT BALANCES TABLE
let accountBalancesTable = [];

const accountsList = randAccount({ length: numberAccounts, accountLength });

// Create account balance row for each account list for all dates
accountsList.forEach((accountNumber) => {
  const baseAccounBalRow = {
    'Account Number': accountNumber,
    'Location': selectRandValue(SUBSET_COUNTRIES),
    'Datetime': new Date(fromDate),
    'Account Currency': selectRandValue(SUBSET_CURRENCIES),
    'Product Type': selectRandValue(BANKING_PRODUCT_TYPES),
    // 'Account Status': selectRandValue(['Active', 'Suspended']),
    'Financial Institution': `Bank of ${randNumber({min: 1, max: 20})}`,
    'Account Currency Balance': null,
    'Entity': randCompanyName(),
  } 
  
  dates.forEach((date) => {
    const dailyAccountBalRow = {
      ...baseAccounBalRow,
      'Datetime': date,
      'Account Currency Balance': null,
    }
    accountBalancesTable.push(dailyAccountBalRow)
  })
})

console.log('accountBalancesTable', accountBalancesTable)

// GENERATE ROW DATA FOR TRANSACTIONS TABLE

let transactionsTable = []

accountsList.forEach((accountNumber) => {
  // Generating random number of transactions for a specific account number
  const noTransactions = randNumber({ min: 0, max: 100 })
  const transactionAmounts = randNumber({ length: noTransactions, min: -100000, max: 100000, fraction: 2 })
  console.log('transactionAmounts', transactionAmounts)

  // Updating the balance in the Account Balances list so it adds up.
  const accountBalance = transactionAmounts.reduce((prevValue, nextValue) => prevValue + nextValue, [0])
  console.log('accountBalance', accountBalance)

  const transactionRows = transactionAmounts.map((amount) => {
    const transactionType = selectRandValue(['Internal Transfer', 'Cross Border Transfer', 'Direct Debit', 'Cheque'])
    return {
      'Account Number': accountNumber,
      'Location': setLocation,
      'Account Currency': setCurrency,
      'Financial Institution': selectRandValue(['Bank of 1', 'Bank of 2', 'Bank of 3', 'Bank of 4']),
      'Datetime': new Date(currentDate),
      'Transaction type': transactionType,
      'Inflows / Outflows': selectRandValue(['Outflow', 'Inflow']),
      'Entity': randCompanyName(),
      'Transaction Amount in Account Currency': amount,
      'Counterparty': randFullName()
    }
  })
  transactionsTable = [...transactionsTable, transactionRows]
})

console.log('transactionsTable', transactionsTable)


// CREATE TRANSACTIONS TABLE
import {createObjectCsvWriter} from 'csv-writer'
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createObjectCsvWriter({
  path: 'out.csv',
  header: [
    { id: 'Account Number', title: 'Account Number' },
    { id: 'Location', title: 'Location' },
    { id: 'Datetime', title: 'Datetime' },
    { id: 'Account Currency', title: 'Account Currency' },
    { id: 'Product Type', title: 'Product Type' },
    { id: 'Account Status', title: 'Account Status' },
    { id: 'Financial Institution', title: 'Financial Institution' },
    { id: 'Account Currency Balance', title: 'Account Currency Balance' },
    { id: 'Base Currency Balance (GBP)', title: 'Base Currency Balance (GBP)' },
    { id: 'Entity', title: 'Entity' },
  ]
});

csvWriter
  .writeRecords(accountBalancesTable)
  .then(()=> console.log('The CSV file was written successfully'));