import React from 'react';

export type AppContextType = {
    airtableApiKey: string;
    copilotApiKey: string;
    baseId: string;
    tableId: string;
    viewId: string;
    defaultChannelType: string
};

export const AppContext = React.createContext<AppContextType | null>(null);