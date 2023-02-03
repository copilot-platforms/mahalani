import { Grid, Switch, Box, Typography, Button } from "@mui/material";
import { useState } from "react";
import { AppContextType, AppSetupControls } from "../utils/appContext";


type AdvancedSetupProps = {
  appSetupData: AppContextType;
  onConfigSave: (input: AppContextType) => void;
}

export const AdvancedSetup = ({ appSetupData, onConfigSave }: AdvancedSetupProps) => {
  const { controls = {} } = appSetupData
  const [controlState, setControlState] = useState<AppSetupControls>(controls as AppSetupControls)
  const {
    allowAddingItems = false,
    allowUpdatingStatus = false,
    allowingUpdatingDetails = false,
  } = controlState;

  const handleToggleControl = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetId = event.target.id;
    const updatedControls = { ...controlState, [targetId]: !controlState[targetId] };
    setControlState(updatedControls);
    const updatedConfig = { ...appSetupData, controls: updatedControls };
    onConfigSave(updatedConfig); 
  }

  return (
    <Grid container mt={4} maxWidth={800}>
      <Grid item xs={12}>
        <Typography variant="h6">Advanced Controls</Typography>
      </Grid>
      <Grid item xs={12} container>
        <Grid item xs={9}>Let clients add items</Grid>
        <Grid item xs={3}>
          <Box display="flex" justifyContent="flex-end">
            <Switch id="allowAddingItems" checked={allowAddingItems} onChange={handleToggleControl} />
          </Box>
        </Grid>
      </Grid>
      <Grid item xs={12} container>
        <Grid item xs={9}>Let clients update status</Grid>
        <Grid item xs={3}>
          <Box display="flex" justifyContent="flex-end">
            <Switch id="allowUpdatingStatus" checked={allowUpdatingStatus} onChange={handleToggleControl} />
          </Box>
        </Grid>
      </Grid>
      <Grid item xs={12} container>
        <Grid item xs={9}>Let clients edit details</Grid>
        <Grid item xs={3}>
          <Box display="flex" justifyContent="flex-end">
            <Switch id="allowingUpdatingDetails" checked={allowingUpdatingDetails} onChange={handleToggleControl} />
          </Box>
        </Grid>
      </Grid>
    </Grid>
  )
};