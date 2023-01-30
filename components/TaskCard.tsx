import React from 'react';
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Stack,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Task, TaskStatus } from './types';
import { AirtableContext } from '../utils/airtableContext';
import { getAirtableClient, updateRecord } from '../utils/airtableUtils';

interface TaskCardProps extends Task {
  onStatusChange: (status: TaskStatus) => void;
}

/**
 * This component represents the task card.
 * @param title The title of the task
 * @param assigneeProfilePicture The profile picture of the assignee
 */
const TaskCard = ({ title, assignee, status, id, onStatusChange }: TaskCardProps) => {
  const appSetupData = React.useContext(AirtableContext);

  const handleStatusChange = async (event: SelectChangeEvent) => {
    
    onStatusChange(event.target.value as TaskStatus);

    const baseConstructor = getAirtableClient(
      appSetupData.apiKey,
      appSetupData.baseId,
    );
    const tableClient = baseConstructor(appSetupData.tableId);

    try {
     await updateRecord(tableClient, id, { Status: event.target.value as TaskStatus })
    } catch (ex) {
      console.error('Error updating record', ex);
    }
  }
  
  return (
    <Card variant="outlined">
      <CardHeader title={title} />
      <CardContent>
        <Stack spacing={2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar
              sx={{ width: 24, height: 24 }}
              alt="Remy Sharp"
              src="/static/images/avatar/1.jpg"
            />
            {assignee.givenName} {assignee.familyName}
          </div>
          <FormControl>
          <InputLabel id={`status-label-${id}`}>Status</InputLabel>
          <Select
            labelId={`status-label-${id}`}
            id={`status-select-${id}`}
            value={status}
            label="Status"
            onChange={handleStatusChange}
          >
            <MenuItem value={TaskStatus.Todo}>{TaskStatus.Todo}</MenuItem>
            <MenuItem value={TaskStatus.InProgress}>{TaskStatus.InProgress}</MenuItem>
            <MenuItem value={TaskStatus.Done}>{TaskStatus.Done}</MenuItem>
          </Select>
        </FormControl>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
