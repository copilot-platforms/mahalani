import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import { AppContextType } from './appContext';
import { AddRecordInput } from '../components/types';

const GOOGLE_BOT_CREDS = {
  private_key: process.env.GOOGLE_SHEET_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  client_email: process.env.GOOGLE_SHEET_CLIENT_EMAIL,
};

/**
 * Method to check if user is using Google sheet
 * or Airtable as their database
 * @param config config saved in S3
 * @returns true if database is Google Sheet
 */
export const isDBUsingGoogleSheets = (config: AppContextType) =>
  Boolean(config.googleSheetId);

/**
 * Get the google sheet instance
 * This instance will be used to perform actions on the sheet
 * @param sheetId id of the sheet
 * @param subSheetTitle title of the sub sheet
 * @returns
 */
const getSheet = async (
  sheetId: string,
  subSheetTitle?: string,
  token?: string,
): Promise<GoogleSpreadsheetWorksheet> => {
  const doc = new GoogleSpreadsheet(sheetId);

  if (token) {
    doc.useRawAccessToken(token); // authenticate user
  }
  await doc.loadInfo(); // loads document properties and worksheets
  return doc.sheetsByTitle[subSheetTitle || 'Task List']; // get page by it's title
};

/**
 * Get all tasks of the client
 * @param sheetId sheet id from which tasks needs to be fetched
 * @param assigneeId client id to filter data
 * @returns all tasks
 */
export const getRecordsFromSheet = async (
  sheetId: string,
  assigneeId: string,
  token: string,
) => {
  const sheet = await getSheet(sheetId, 'Task List', token);
  await sheet.loadHeaderRow();
  const headerValues = sheet.headerValues;
  const rows = await sheet.getRows(); // return the rows from the sheet

  // formatting data to match the Airtable response
  const allTasks = rows.map((row) => {
    const rowId = row._rowNumber;
    const fields = {};
    headerValues.map((header) => {
      fields[header] = row[header] || '';
    });
    return {
      id: rowId,
      fields: fields,
    };
  });

  // return filtered tasks based on client id
  return allTasks.filter((t) => t.fields['Assignee ID'] === assigneeId);
};

/**
 * Create a new task in google sheet
 * @param sheetId id of the sheet
 * @param rowData new task data
 * @returns newly created record
 */
export const addRecordInSheet = async (
  sheetId: string,
  rowData: AddRecordInput,
): Promise<any> => {
  const sheet = await getSheet(sheetId);
  await sheet.loadHeaderRow();
  const headerValues = sheet.headerValues;

  const body = { ...rowData };

  // when user adds first task reference record will be empty
  if (!rowData['Assignee - Reference Record']) {
    const assigneeMapSheet = await getSheet(sheetId, 'Assignee ID Mapping'); // get assignee map sheet
    const records = await assigneeMapSheet.getRows(); // all assignees

    // find assignee based on 'Assignee ID' available in request
    const currentAssignee = records.find(
      (r) => r['Assignee ID'] === rowData['Assignee ID'],
    );

    if (currentAssignee)
      body['Assignee - Reference Record'] = currentAssignee['Assignee Name'];
  }
  // we don't need to send assignee id here
  // it will be autofilled by the google sheet based
  // on assignee reference
  delete body['Assignee ID'];

  const newRow = await sheet.addRow(body);
  await newRow.save();

  const newRecord = {};

  headerValues.map((header) => {
    newRecord[header] = newRow[header] || '';
  });

  return newRecord;
};

/**
 * Update the google sheet record
 * @param sheetId  id of the sheet
 * @param recordId this is row id.
 * @param rowData  updated values of the row
 * @returns updated record
 */
export const updateRecordInSheet = async (
  sheetId: string,
  recordId: string,
  rowData: any,
) => {
  const sheet = await getSheet(sheetId);
  await sheet.loadHeaderRow();
  const headerValues = sheet.headerValues;
  const rows = await sheet.getRows(); // all tasks

  // task that needs to be updated
  const row = rows.find((r) => r._rowNumber === Number(recordId));
  if (!row) return null;

  await sheet.loadCells();

  //currently we are only updating status and description of the task

  // if udpate values have status
  // update the status
  if (rowData.Status) {
    const cell = sheet.getCellByA1(`C${recordId}`);
    cell.value = rowData.Status;
    await cell.save();
  }
  // if udpate values have description
  // update the description of the task
  if (rowData.Description) {
    const cell = sheet.getCellByA1(`B${recordId}`);
    cell.value = rowData.Description;
    await cell.save();
  }

  const updatedRecord = {};

  headerValues.map((header) => {
    updatedRecord[header] = row[header] || '';
  });

  return updatedRecord;
};
