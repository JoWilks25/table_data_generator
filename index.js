import { randAccount, randBetweenDate, randNumber, randCompanyName, randFullName } from '@ngneat/falso';
import { selectRandValue, getDates, generateRandomBankName } from './helpers/functions.js'
import { SUBSET_COUNTRIES, SUBSET_CURRENCIES, BANKING_PRODUCT_TYPES } from './helpers/sampleDataLists.js'

// VARIABLES
const numberAccounts = 10
const accountLength = 12
const fromDate = '01/01/2022'
const toDate = '12/31/2022'

// GENERATE ARRAY OF DATES FOR SPECIFIED DATE RANGE
const dates = getDates(new Date(fromDate), new Date(toDate))

// GENERATE ROW DATA FOR ACCOUNT BALANCES TABLE
let accountBalancesTable = [];

const accountNosList = randAccount({ length: numberAccounts, accountLength });

// Create account balance row for each account number for all dates
accountNosList.forEach((accountNumber) => {
  const baseAccounBalRow = {
    'Account Number': accountNumber,
    'Location': selectRandValue(SUBSET_COUNTRIES),
    'Datetime': new Date(fromDate),
    'Account Currency': selectRandValue(SUBSET_CURRENCIES),
    'Product Type': selectRandValue(BANKING_PRODUCT_TYPES),
    'Financial Institution': generateRandomBankName(),
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



// GENERATE ROW DATA FOR TRANSACTIONS TABLE
let transactionsTable = []

accountNosList.forEach((accountNumber) => {
  dates.forEach((date) => {
    // Generating random number of transactions for a specific account number
    const noTransactions = randNumber({ min: 0, max: 50 })
    const transactionAmounts = randNumber({ length: noTransactions, min: -100000, max: 100000, fraction: 2 })

    // Updating the balance in the Account Balances list so it adds up.
    const accountBalance = transactionAmounts.reduce((prevValue, nextValue) => Number(prevValue) + Number(nextValue), [0])
    accountBalancesTable.forEach((accountBalRowObj) => {
      if (accountBalRowObj['Account Number'] === accountNumber && accountBalRowObj.Datetime === date) {
        accountBalRowObj['Account Currency Balance'] = accountBalance;
      }
    })

    const endDateTime = new Date(date.toISOString().split('T')[0]).setHours(23, 59, 99, 999)

    // Creating each transaction row based off the amounts
    transactionAmounts.forEach((amount) => {
      const transactionType = selectRandValue(['Internal Transfer', 'Cross Border Transfer', 'Direct Debit', 'Cheque'])
      const transactionRow = {
        'Account Number': accountNumber,
        'Location': selectRandValue(SUBSET_COUNTRIES),
        'Account Currency': selectRandValue(SUBSET_CURRENCIES),
        'Financial Institution': generateRandomBankName(),
        'Datetime': randBetweenDate({ from: date, to: endDateTime }),
        'Transaction type': transactionType,
        'Inflows / Outflows': selectRandValue(['Outflow', 'Inflow']),
        'Entity': randCompanyName(),
        'Transaction Amount in Account Currency': amount,
        'Counterparty': randFullName()
    
      }
      transactionsTable.push(transactionRow)
    })
  })
})


// WRITE ACCOUNT BALANCES TABLE TO CSV
import { createObjectCsvWriter } from 'csv-writer'
const csvWriterAccountBalances = createObjectCsvWriter({
  path: 'output/account_balances.csv',
  header: [
    { id: 'Account Number', title: 'Account Number' },
    { id: 'Location', title: 'Location' },
    { id: 'Datetime', title: 'Datetime' },
    { id: 'Account Currency', title: 'Account Currency' },
    { id: 'Product Type', title: 'Product Type' },
    { id: 'Financial Institution', title: 'Financial Institution' },
    { id: 'Account Currency Balance', title: 'Account Currency Balance' },
    { id: 'Entity', title: 'Entity' },
  ]
});

csvWriterAccountBalances
  .writeRecords(accountBalancesTable)
  .then(() => console.log('The Account Balances CSV file was written successfully'));

// WRITE TRANSACTIONS TABLE TO CSV
const csvWriterTransactions = createObjectCsvWriter({
  path: 'output/transactions.csv',
  header: [
    { id: 'Account Number', title: 'Account Number' },
    { id: 'Location', title: 'Location' },
    { id: 'Account Currency', title: 'Account Currency' },
    { id: 'Financial Institution', title: 'Financial Institution' },
    { id: 'Datetime', title: 'Datetime' },
    { id: 'Transaction type', title: 'Transaction type' },
    { id: 'Inflows / Outflows', title: 'Inflows / Outflows' },
    { id: 'Entity', title: 'Entity' },
    { id: 'Transaction Amount in Account Currency', title: 'Transaction Amount in Account Currency' },
    { id: 'Counterparty', title: 'Counterparty' },
  ]
});

csvWriterTransactions
  .writeRecords(transactionsTable)
  .then(() => console.log('The Transactions CSV file was written successfully'));