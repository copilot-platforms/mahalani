import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appbpdKJXGtljWY7i');

const taskList = base('Task List')