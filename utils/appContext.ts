import React from 'react';

export type AppContextType = {
    airtableApiKey: string;
    copilotApiKey: string;
    baseId: string;
    tableId: string;
    viewId: string;
};

export const AppContext = React.createContext<AppContextType | null>(null);