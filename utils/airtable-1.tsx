import Airtable from 'airtable'

let baseId = 'appbpdKJXGtljWY7i'
let tableName = 'Task List'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(baseId);

const taskListTable = base(tableName)

export const getAllTasks = async (id) => {
    let tasksArr = []

    const records = await taskListTable.select({
        maxRecords: 150,
        // view: "Grid view",
        filterByFormula: `{Relevant Client ID} = "${id}"`
    }).eachPage(function page(records, fetchNextPage) {

        records.forEach((record) => {
            console.log(record.fields)
            tasksArr.push({
                name: record.fields.Name,
                
            })
            // tasksArr.push(record.fields[0])
        })

        fetchNextPage()

    })
    return tasksArr

}

