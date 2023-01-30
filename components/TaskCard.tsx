import React from 'react';
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
} from '@mui/material';
import { Task, TaskStatus } from './types';

type TaskCardProps = Task;
/**
 * This component represents the task card.
 * @param title The title of the task
 * @param assigneeProfilePicture The profile picture of the assignee
 */
const TaskCard = ({ title, description, assignee }: TaskCardProps) => (
  <Card variant="outlined">
    <CardHeader title={title} />
    <CardContent>
      <p>{description}</p>

      <Stack>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar
            sx={{ width: 24, height: 24 }}
            alt="Remy Sharp"
            src="/static/images/avatar/1.jpg"
          />
          {assignee.givenName} {assignee.familyName}
        </div>
      </Stack>
    </CardContent>
  </Card>
);

export default TaskCard;
