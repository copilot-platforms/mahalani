import { useState, useEffect } from "react";
import { listBases, ApiBaseItem, getAirtableClient, ApiTableItem, listTables } from "../utils/airtableUtils";

const AppSetup = ({ onSetupComplete }) => {
    const [airtableApiKey, setAirtableApiKey] = useState('');
    const [airtableBases, setAirtableBases] = useState<ApiBaseItem[]>([]);
    const [tables, setTables] = useState<ApiTableItem[]>([]);
    const [selectedBaseId, setSelectedBaseId] = useState<string>('');
    const [selectedTableId, setSelectedTableId] = useState<string>('');

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('submitted form', airtableApiKey);
        onSetupComplete({
            apiKey: airtableApiKey,
            baseId: selectedBaseId,
            tableId: selectedTableId,
        });
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
        </form>
    )
}

export default AppSetup;