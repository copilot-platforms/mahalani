import React from 'react';

export type AppSetupControls = {
    allowAddingItems?: boolean;
    allowUpdatingStatus?: boolean;
    allowingUpdatingDetails?: boolean;
}

export type AppContextType = {
    airtableApiKey: string;
    copilotApiKey: string;
    baseId: string;
    tableId: string;
    viewId: string;
    defaultChannelType: string;
    controls?: AppSetupControls;
};

export const AppContext = React.createContext<AppContextType | null>(null);