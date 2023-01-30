import Airtable, { Base } from 'airtable';

export type ApiBaseItem = {
    id: string;
    name: string;
}

export type ApiTableItem = {
    id: string;
    name: string;
};

export const getAirtableClient = (apiKey: string, baseId: string) => {
    return new Airtable({
        apiKey,
    }).base(baseId); 
}

export const listBases = async (apiKey: string): Promise<ApiBaseItem[]> => {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases`, {
        headers: new Headers({
            Authorization: `Bearer ${apiKey}`,
        })
    });
    const data = await response.json();
    return data.bases;  
}

export const listTables = async (apiKey: string, baseId: string): Promise<ApiTableItem[]> => {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: new Headers({
            Authorization: `Bearer ${apiKey}`,
        })
    });
    const data = await response.json();
    return data.tables;
}