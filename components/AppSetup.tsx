import { useState, useEffect } from "react";
import { listBases, ApiBaseItem, ApiTableItem, listTables } from "../utils/airtableUtils";

const AppSetup = ({ onSetupComplete }) => {
    const [airtableApiKey, setAirtableApiKey] = useState('');
    const [copilotApiKey, setCopilotApiKey] = useState('');
    const [airtableBases, setAirtableBases] = useState<ApiBaseItem[]>([]);
    const [tables, setTables] = useState<ApiTableItem[]>([]);
    const [selectedBaseId, setSelectedBaseId] = useState<string>('');
    const [selectedTableId, setSelectedTableId] = useState<string>('');
    const [validationError, setValidationError] = useState<string>('');

    const loadBases = async () => {
        const bases = await listBases(airtableApiKey);
        console.info('bases', bases);
        if (!bases) {
            setValidationError("Invalid Airtable API key");
            setAirtableBases([]);
            return;
        } else {
            setValidationError("");
        }
        if (bases.length > 0) {
            setSelectedBaseId(bases[0].id);
        }
        setAirtableBases(bases);
    };

    const loadTables = async () => {
        const tables = await listTables(airtableApiKey, selectedBaseId);
        console.info('tables', tables);
        if (!tables || tables.length == 0) {
            setValidationError("No tables found in this Airtable");
            return;
        } else {
            setValidationError("");
        }
        if (tables.length > 0) {
            setSelectedTableId(tables[0].id);
        }
        setTables(tables);
    };

    useEffect(() => {
        if (!selectedBaseId) {
            return;
        }

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
        let errorMessage = "";
        if (filteredTables.length > 0) {
            const selectedFields = filteredTables[0].fields;
            const nameFields = selectedFields.filter((field) => field.name.toLowerCase() == 'name');
            const clientIdFields = selectedFields.filter((field) => field.name.toLowerCase() == 'client id');
            const statusFields = selectedFields.filter((field) => field.name.toLowerCase() == 'status');
            const priorityFields = selectedFields.filter((field) => field.name.toLowerCase() == 'priority');
            if (!filteredTables[0].views || filteredTables[0].views.length == 0 || !filteredTables[0].views[0].id) {
                errorMessage = "Selected table has no views";
            }
            else if (nameFields.length === 0) {
                errorMessage = "Selected table has no field called 'Name'";
            } else if (clientIdFields.length === 0) {
                errorMessage = "Selected table has no field called 'Client ID'";
            } else if (statusFields.length === 0) {
                errorMessage = "Selected table has no field called 'Status'";
            } else if (priorityFields.length > 0 &&
                (priorityFields[0].type !== 'singleSelect' ||
                    !priorityFields[0].options ||
                    !priorityFields[0].options.choices ||
                    priorityFields[0].options.choices.length !== 3 ||
                    priorityFields[0].options.choices.filter((choice) => choice.name.toLowerCase() == 'high').length == 0 ||
                    priorityFields[0].options.choices.filter((choice) => choice.name.toLowerCase() == 'medium').length == 0 ||
                    priorityFields[0].options.choices.filter((choice) => choice.name.toLowerCase() == 'low').length == 0
                )) {
                errorMessage = "If you have a Priority field, it must be single-select type with exactly 3 options - called 'High', 'Medium', and 'Low'";
            } else {
                const statusField = statusFields[0];
                if (statusField.type !== 'singleSelect' ||
                    !statusField.options ||
                    !statusField.options.choices ||
                    statusField.options.choices.length === 0) {
                    errorMessage = "Status field needs to be single-select type";
                } else {
                    const statusChoices = statusField.options.choices;
                    if (statusChoices.length !== 3 ||
                        statusChoices.filter((choice) => choice.name.toLowerCase() == 'todo').length == 0 ||
                        statusChoices.filter((choice) => choice.name.toLowerCase() == 'in progress').length == 0 ||
                        statusChoices.filter((choice) => choice.name.toLowerCase() == 'done').length == 0) {
                        errorMessage = "Status field needs exactly 3 options - called 'Todo', 'In Progress', and 'Done'";
                    }
                }
            }
        } else {
            errorMessage = "No table found"
        }
        return errorMessage;
    }
    const validateCopilotApiKey = () => {
        if (copilotApiKey === "") {
            return "No Copilot API Key entered";
        }
        return "";
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('submitted form', airtableApiKey);

        const filteredTables = tables.filter((table) => table.id === selectedTableId);
        const errorMessage = validateSelectedTable(filteredTables) || validateCopilotApiKey();
        const selectedViewId = filteredTables[0].views[0].id;

        if (errorMessage === "") {
            onSetupComplete({
                airtableApiKey: airtableApiKey,
                copilotApiKey: copilotApiKey,
                baseId: selectedBaseId,
                tableId: selectedTableId,
                viewId: selectedViewId,
            });
        }
        else {
            setValidationError(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <input type="text" name="copilot-api-key" placeholder="What is your copilot api key?" onChange={(e) => setCopilotApiKey(e.target.value)} />
            <input type="text" name="api-key" placeholder="What is your airtable access token?" onChange={(e) => setAirtableApiKey(e.target.value)} />
            <select onChange={e => setSelectedBaseId(e.target.value)}>
                {airtableBases.map((base) => (
                    <option key={base.id} value={base.id}>{base.name}</option>
                ))}
            </select>
            <select onChange={e => setSelectedTableId(e.target.value)}>
                {tables.map((table) => (
                    <option key={table.id} value={table.id}>{table.name}</option>
                ))}
            </select>
            <input type="submit" value="Submit" />
            <div style={{ color: 'red' }}>{validationError}</div>
        </form>
    )
}

export default AppSetup;