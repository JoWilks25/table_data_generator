import { randAccount } from '@ngneat/falso';
import { randCountry } from '@ngneat/falso';
import { randNumber } from '@ngneat/falso';
import { randBetweenDate } from '@ngneat/falso';
import { randCurrencyCode } from '@ngneat/falso';
import { randCompanyName } from '@ngneat/falso';

import ALL_CURRENCIES from './standardDataLists/currencies.js';
import BANKING_PRODUCT_TYPES from './standardDataLists/productTypes.js';

// FUNCTIONS
const generateRandDate = (fromDateString, toDateString) => randBetweenDate({ from: new Date(fromDateString), to: new Date(toDateString) })
const selectRandValue = (array) => array[Math.floor(Math.random() * array.length)];

// VARIABLES
const numberAccounts = 10
const accountLength = 12
const setLocation = 'United Kingdom'
const fromDate = '01/01/2022'
const toDate = '12/31/2022'

// GENERATE ROW DATA
let accountBalancesTable = [];

const accountsList = randAccount({ length: numberAccounts, accountLength });

accountsList.forEach((account) => {
    const accountBalance = randNumber({ min: 0, max: 100000000})
    // selectRandValue(['GBP', 'EUR', 'USD'])
    const accountObject = {
        'Account Number': account,
        'Location': setLocation || randCountry(),
        'Datetime': generateRandDate(fromDate, toDate),
        'Account Currency': 'GBP',
        'Product Type': selectRandValue(BANKING_PRODUCT_TYPES),
        'Account Status': selectRandValue(['Active', 'Suspended']),
        'Financial Institution': selectRandValue(['Bank of 1', 'Bank of 2', 'Bank of 3', 'Bank of 4']),
        'Account Currency Balance': accountBalance,
        'Base Currency Balance (GBP)': accountBalance,
        'Entity': randCompanyName(),
    }
    accountBalancesTable.push(accountObject)
})

console.log('accountBalancesTable', accountBalancesTable)
