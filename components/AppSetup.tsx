import {
  Button,
  Card,
  CardHeader,
  CircularProgress,
  FormControl,
  Skeleton,
  TextField,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState, useEffect } from 'react';
import {
  listBases,
  ApiBaseItem,
  ApiTableItem,
  listTables,
} from '../utils/airtableUtils';
import AppSetupStepper from './SetupSteps';

enum SetupSteps {
  ProvideApiKeys = 0,
  SelectData = 1,
}
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  card: {
    padding: 16,
    width: 350,
    boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.07)',
  },

  title: {
    justifyContent: 'center',
  },
}));

const steps = ['Provide API keys', 'Select your data'];

const AppSetup = ({ onSetupComplete }) => {
  const [activeStep, setActiveStep] = useState(SetupSteps.ProvideApiKeys);
  const classes = useStyles();
  const [airtableApiKey, setAirtableApiKey] = useState('');
  const [copilotApiKey, setCopilotApiKey] = useState('');
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

    loadTables();
  }, [selectedBaseId, airtableApiKey]);

  /**
   * listen for changes to the airtableApiKey
   * once it's set, we can call airtable api to list bases
   * */
  useEffect(() => {
    if (!airtableApiKey) {
      return;
    }
    setActiveStep(SetupSteps.SelectData);

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
        (field) => field.name.toLowerCase() == 'client id',
      );
      const statusFields = selectedFields.filter(
        (field) => field.name.toLowerCase() == 'status',
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
        errorMessage = "Selected table has no field called 'Client ID'";
      } else if (statusFields.length === 0) {
        errorMessage = "Selected table has no field called 'Status'";
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
      });
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
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
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
            </>
          )}

          {loadingInputState.loadingBases ||
            (loadingInputState.loadingTables && (
              <>
                <Skeleton variant="rect" width="100%" height={40} />
                <Skeleton variant="rect" width="100%" height={40} />
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
                      <option key={base.id} value={base.id}>
                        {base.name}
                      </option>
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
                      <option key={table.id} value={table.id}>
                        {table.name}
                      </option>
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
              activeStep === SetupSteps.SelectData ? 'contained' : 'outlined'
            }
          >
            Finish
          </Button>
          <div style={{ color: 'red' }}>{validationError}</div>
        </form>
      </Card>
    </div>
  );
};

export default AppSetup;
