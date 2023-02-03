import Airtable, { FieldSet, Records, Table } from 'airtable';

export type ApiBaseItem = {
  id: string;
  name: string;
};

export type ApiTableFieldOption = {
  id: string;
  name: string;
};

export type ApiTableFieldOptions = {
  choices: ApiTableFieldOption[];
};

export type ApiTableField = {
  id: string;
  type: string;
  name: string;
  options?: ApiTableFieldOptions;
};

export type ApiTableView = {
  id: string;
  type: string;
  name: string;
};

export type ApiTableItem = {
  id: string;
  name: string;
  fields: ApiTableField[];
  views: ApiTableView[];
};

export const getAirtableClient = (apiKey: string, baseId: string) => {
  return new Airtable({
    apiKey,
  }).base(baseId);
};

export const listBases = async (apiKey: string): Promise<ApiBaseItem[]> => {
  const response = await fetch(`https://api.airtable.com/v0/meta/bases`, {
    headers: new Headers({
      Authorization: `Bearer ${apiKey}`,
    }),
  });
  const data = await response.json();
  return data.bases;
};

export const listTables = async (
  apiKey: string,
  baseId: string,
): Promise<ApiTableItem[]> => {
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
    {
      headers: new Headers({
        Authorization: `Bearer ${apiKey}`,
      }),
    },
  );
  const data = await response.json();
  return data.tables;
};

export const getAllRecords = async (
  table: Table<FieldSet>,
  viewId: string,
  filterByFormula: string,
) => {
  let allRecords = [];

  const records = await table
    .select({
      maxRecords: 150,
      view: viewId || '',
      filterByFormula,
    })
    .eachPage(function page(records, fetchNextPage) {
      allRecords = [...allRecords, ...records];
      fetchNextPage();
    });
  return allRecords;
};

export const updateRecord = async (
  table: Table<FieldSet>,
  recordId: string,
  fields: FieldSet,
) => {
  // do partial update on airtable record for provided fields
  const record = await table.update(recordId, fields);
};

export const addRecord = async (table: Table<FieldSet>, fields: FieldSet) => {
  const newRecord = await table.create(fields);
};
