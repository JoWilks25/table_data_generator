// Defining the Fields/Headers for the different tables of data

const PrimaryKey = 'Account Number'

// AccountBalancesFields
export const CoreDataFields = [
    'Account Number',
    'Location',
    'Datetime',
    'Account Currency',
    'Product Type',
    'Account Status',
    'Financial Institution',
    'Account Currency Balance',
    'Base Currency Balance (GBP)',
    'Entity'
]

// Transactions Data
export const RelationalDataFields = [
    'Account Number',
    'Location',
    'Account Currency',
    'Financial Institution',
    'Datetime',
    'Transaction type',
    'Inflows / Outflows',
    'Entity',
    'Transaction Amount in Account Currency',
    'Transaction Amount in Base Currency (GBP)',
    'Transaction Volume'
]