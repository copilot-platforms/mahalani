import React from 'react';

export type AirtableContextType = {
    apiKey: string;
    baseId: string;
    tableId: string;
    viewId: string;
};

export const AirtableContext = React.createContext<AirtableContextType | null>(null);