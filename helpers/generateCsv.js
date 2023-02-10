// WRITE ACCOUNT BALANCES TABLE TO CSV
import { createObjectCsvWriter } from 'csv-writer'

const generateCsv = (tableData, path, headers) => {
  const csvWriterAccountBalances = createObjectCsvWriter({
    path: path,
    header: headers
  });
  
  csvWriterAccountBalances
    .writeRecords(tableData)
    .then(() => console.log(`The ${path} file was written successfully`));
}

export default generateCsv;