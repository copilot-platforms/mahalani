import { useState, useEffect } from "react";
import { listBases, ApiBaseItem, getAirtableClient, ApiTableItem, listTables } from "../utils/airtableUtils";

const AppSetup = ({ onSetupComplete }) => {
    const [airtableApiKey, setAirtableApiKey] = useState('');
    const [airtableBases, setAirtableBases] = useState<ApiBaseItem[]>([]);
    const [tables, setTables] = useState<ApiTableItem[]>([]);
    const [selectedBaseId, setSelectedBaseId] = useState<string>('');
    const [selectedTableId, setSelectedTableId] = useState<string>('');
    const [tableValidationError, setTableValidationError] = useState<string>('');

    const loadBases = async () => {
        const bases = await listBases(airtableApiKey);
        console.info('bases', bases);
        if (bases.length > 0) {
            setSelectedBaseId(bases[0].id);
        }
        setAirtableBases(bases);
    };

    const loadTables = async () => {
        const tables = await listTables(airtableApiKey, selectedBaseId);
        console.info('tables', tables);
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

    const validateSelectedTable = (filteredTables) => {
        let errorMessage = "";
        if (filteredTables.length > 0) {
            const selectedFields = filteredTables[0].fields;
            const nameFields = selectedFields.filter((field) => field.name.toLowerCase() == 'name');
            const clientIdFields = selectedFields.filter((field) => field.name.toLowerCase() == 'client id');
            const statusFields = selectedFields.filter((field) => field.name.toLowerCase() == 'status');
            if (nameFields.length === 0) {
                errorMessage = "Selected table has no field called 'Name'";
            } else if (clientIdFields.length === 0) {
                errorMessage = "Selected table has no field called 'Client ID'";
            } else if (statusFields.length === 0) {
                errorMessage = "Selected table has no field called 'Status'";
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
        }
        return errorMessage;
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('submitted form', airtableApiKey);

        const filteredTables = tables.filter((table) => table.id === selectedTableId);
        const errorMessage = validateSelectedTable(filteredTables);

        if (errorMessage === "") {
            onSetupComplete({
                apiKey: airtableApiKey,
                baseId: selectedBaseId,
                tableId: selectedTableId,
            });
        }
        else {
            setTableValidationError(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column'}}>
            <input type="text" name="api-key" placeholder="What is your air-table api key?" onChange={(e) => setAirtableApiKey(e.target.value)} />
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
            <div style={{color: 'red'}}>{tableValidationError}</div>
        </form>
    )
}

export default AppSetup;