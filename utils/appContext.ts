import React from 'react';

export type AppSetupControls = {
  allowAddingItems?: boolean;
  allowUpdatingStatus?: boolean;
  allowingUpdatingDetails?: boolean;
};

export type ClientAppConfig = {
  controls?: AppSetupControls;
  defaultChannelType: string;
};

export type AppContextType = {
  airtableApiKey: string;
  googleSheetId: string;
  copilotApiKey: string;
  baseId: string;
  tableId: string;
  viewId: string;
} & ClientAppConfig;

export const AppContext = React.createContext<ClientAppConfig | null>(null);
