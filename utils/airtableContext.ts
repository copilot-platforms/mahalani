import React from 'react';

export type AirtableContextType = {
    apiKey: string;
    baseId: string;
    tableId: string;
};

export const AirtableContext = React.createContext<AirtableContextType | null>(null);