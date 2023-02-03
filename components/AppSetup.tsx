import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  MenuItem,
  Skeleton,
  TextField,
  RadioGroup,
  Radio,
  FormLabel,
  FormControlLabel
} from '@mui/material';
import { useState, useEffect } from 'react';
import {
  listBases,
  ApiBaseItem,
  ApiTableItem,
  listTables,
} from '../utils/airtableUtils';
import { makeStyles } from '../utils/makeStyles';
import DataTable from './DataTable';
import AppSetupStepper from './SetupSteps';

enum SetupSteps {
  ProvideApiKeys = 0,
  SelectData = 1,
  GetStarted = 2,
}

const useStyles = makeStyles<{ cardWidth: number | string }>()(
  (theme, { cardWidth }) => ({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      padding: 16,
      width: cardWidth,
      boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.07)',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    title: {
      justifyContent: 'center',
    },
  }),
);

const steps = ['Provide API keys', 'Select your data', 'Get started'];

const AppSetup = ({ onSetupComplete, appSetupData, clientsRows }) => {
  const [activeStep, setActiveStep] = useState(
    appSetupData ? SetupSteps.GetStarted : SetupSteps.ProvideApiKeys,
  );
  const { classes } = useStyles({
    cardWidth: clientsRows.length > 0 ? 800 : 350,
  });
  const [airtableApiKey, setAirtableApiKey] = useState('');
  const [copilotApiKey, setCopilotApiKey] = useState('');
  const [defaultChannelType, setDefaultChannelType] = useState<string>('')
  const [airtableBases, setAirtableBases] = useState<ApiBaseItem[]>([]);
  const [tables, setTables] = useState<ApiTableItem[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<string>('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [loadingInputState, setLoadingInputState] = useState({
    loadingTables: false,
    loadingBases: false,
  });
  const loadBases = async () => {
    setLoadingInputState({ ...loadingInputState, loadingBases: true });
    const bases = await listBases(airtableApiKey);
    if (!bases) {
      setValidationError('Invalid Airtable API key');
      setAirtableBases([]);
      return;
    } else {
      setValidationError('');
    }
    if (bases.length > 0) {
      setSelectedBaseId(bases[0].id);
    }
    setAirtableBases(bases);
    setLoadingInputState({ ...loadingInputState, loadingBases: false });
  };

  const loadTables = async () => {
    setLoadingInputState({ ...loadingInputState, loadingTables: true });
    const tables = await listTables(airtableApiKey, selectedBaseId);
    console.info('tables', tables);
    if (!tables || tables.length == 0) {
      setValidationError('No tables found in this Airtable');
      return;
    } else {
      setValidationError('');
    }
    if (tables.length > 0) {
      setSelectedTableId(tables[0].id);
    }
    setTables(tables);
    setLoadingInputState({ ...loadingInputState, loadingTables: false });
  };

  useEffect(() => {
    if (!selectedBaseId) {
      return;
    }
    setActiveStep(SetupSteps.SelectData);
    loadTables();
  }, [selectedBaseId]);

  /**
   * listen for changes to the airtableApiKey
   * once it's set, we can call airtable api to list bases
   * */
  useEffect(() => {
    if (!airtableApiKey) {
      return;
    }

    loadBases();
  }, [airtableApiKey]);

  const validateSelectedTable = (filteredTables: ApiTableItem[]) => {
    let errorMessage = '';
    if (filteredTables.length > 0) {
      const selectedFields = filteredTables[0].fields;
      const nameFields = selectedFields.filter(
        (field) => field.name.toLowerCase() == 'name',
      );
      const clientIdFields = selectedFields.filter(
        (field) => field.name.toLowerCase() == 'assignee id',
      );
      const statusFields = selectedFields.filter(
        (field) => field.name.toLowerCase() == 'status',
      );
      const priorityFields = selectedFields.filter(
        (field) => field.name.toLowerCase() == 'priority',
      );
      if (
        !filteredTables[0].views ||
        filteredTables[0].views.length == 0 ||
        !filteredTables[0].views[0].id
      ) {
        errorMessage = 'Selected table has no views';
      } else if (nameFields.length === 0) {
        errorMessage = "Selected table has no field called 'Name'";
      } else if (clientIdFields.length === 0) {
        errorMessage = "Selected table has no field called 'Assignee ID'";
      } else if (statusFields.length === 0) {
        errorMessage = "Selected table has no field called 'Status'";
      } else if (
        priorityFields.length > 0 &&
        (priorityFields[0].type !== 'singleSelect' ||
          !priorityFields[0].options ||
          !priorityFields[0].options.choices ||
          priorityFields[0].options.choices.length !== 3 ||
          priorityFields[0].options.choices.filter(
            (choice) => choice.name.toLowerCase() == 'high',
          ).length == 0 ||
          priorityFields[0].options.choices.filter(
            (choice) => choice.name.toLowerCase() == 'medium',
          ).length == 0 ||
          priorityFields[0].options.choices.filter(
            (choice) => choice.name.toLowerCase() == 'low',
          ).length == 0)
      ) {
        errorMessage =
          "If you have a Priority field, it must be single-select type with exactly 3 options - called 'High', 'Medium', and 'Low'";
      } else {
        const statusField = statusFields[0];
        if (
          statusField.type !== 'singleSelect' ||
          !statusField.options ||
          !statusField.options.choices ||
          statusField.options.choices.length === 0
        ) {
          errorMessage = 'Status field needs to be single-select type';
        } else {
          const statusChoices = statusField.options.choices;
          if (
            statusChoices.length !== 3 ||
            statusChoices.filter(
              (choice) => choice.name.toLowerCase() == 'todo',
            ).length == 0 ||
            statusChoices.filter(
              (choice) => choice.name.toLowerCase() == 'in progress',
            ).length == 0 ||
            statusChoices.filter(
              (choice) => choice.name.toLowerCase() == 'done',
            ).length == 0
          ) {
            errorMessage =
              "Status field needs exactly 3 options - called 'Todo', 'In Progress', and 'Done'";
          }
        }
      }
    } else {
      errorMessage = 'No table found';
    }
    return errorMessage;
  };
  const validateCopilotApiKey = () => {
    if (copilotApiKey === '') {
      return 'No Copilot API Key entered';
    }
    return '';
  };

  const handleDefaultChannel = (e) => {
    setDefaultChannelType(e.target.value)
  }
  console.log(defaultChannelType)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('submitted form', airtableApiKey);

    const filteredTables = tables.filter(
      (table) => table.id === selectedTableId,
    );
    const errorMessage =
      validateSelectedTable(filteredTables) || validateCopilotApiKey();
    const selectedViewId = filteredTables[0].views[0].id;

    if (errorMessage === '') {
      onSetupComplete({
        airtableApiKey: airtableApiKey,
        copilotApiKey: copilotApiKey,
        baseId: selectedBaseId,
        tableId: selectedTableId,
        viewId: selectedViewId,
        defaultChannelType: defaultChannelType,
      });
      setActiveStep(SetupSteps.GetStarted);
    } else {
      setValidationError(errorMessage);
    }
  };

  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <CardHeader
          title={<AppSetupStepper steps={steps} activeStep={activeStep} />}
        />

        <CardContent>
          {appSetupData && <DataTable rows={clientsRows} />}

          {!appSetupData && (
            <form onSubmit={handleSubmit} className={classes.form}>
              {activeStep === SetupSteps.ProvideApiKeys && (
                <>
                  <FormControl>
                    <TextField
                      fullWidth
                      type="text"
                      name="copilot-api-key"
                      placeholder="What is your copilot api key?"
                      onChange={(e) => setCopilotApiKey(e.target.value)}
                      size="small"
                    />
                  </FormControl>
                  <FormControl>
                    <TextField
                      type="text"
                      name="api-key"
                      placeholder="What is your airtable access token?"
                      onChange={(e) => setAirtableApiKey(e.target.value)}
                      size="small"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel id="demo-row-radio-buttons-group-label" color='primary' >Default channel type:</FormLabel>
                    <RadioGroup 
                    row
                    value={defaultChannelType}
                    onChange={(e) => handleDefaultChannel(e)}
                    >
                      <FormControlLabel 
                      value="clients" 
                      control={<Radio color='primary' size='small' />} 
                      label="Clients" 
                      />
                      <FormControlLabel 
                      value="companies" 
                      control={<Radio color='primary' size='small' />} 
                      label="Companies" />
                      
                    </RadioGroup>
                  </FormControl>
                </>
              )}

              {loadingInputState.loadingBases ||
                (loadingInputState.loadingTables && (
                  <>
                    <Skeleton variant="rectangular" width="100%" height={40} />
                    <Skeleton variant="rectangular" width="100%" height={40} />
                  </>
                ))}

              {activeStep === SetupSteps.SelectData &&
                !loadingInputState.loadingBases &&
                !loadingInputState.loadingTables && (
                  <>
                    <FormControl>
                      <TextField
                        value={selectedBaseId}
                        select
                        onChange={(e) => setSelectedBaseId(e.target.value)}
                        size="small"
                      >
                        {airtableBases.map((base) => (
                          <MenuItem key={base.id} value={base.id}>
                            {base.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FormControl>
                    <FormControl>
                      <TextField
                        select
                        size="small"
                        value={selectedTableId}
                        onChange={(e) => setSelectedTableId(e.target.value)}
                      >
                        {tables.map((table) => (
                          <MenuItem key={table.id} value={table.id}>
                            {table.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FormControl>
                  </>
                )}
              <Button
                size="small"
                disabled={activeStep === SetupSteps.ProvideApiKeys}
                type="submit"
                value="Submit"
                variant={
                  activeStep === SetupSteps.SelectData
                    ? 'contained'
                    : 'outlined'
                }
              >
                Finish
              </Button>
              <div style={{ color: 'red' }}>{validationError}</div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSetup;
