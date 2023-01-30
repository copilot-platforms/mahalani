import React from 'react';
import { Avatar, Card, CardContent, CardHeader, Stack } from '@mui/material';
import { Task, TaskStatus } from './types';

type TaskCardProps = Task;
/**
 * This component represents the task card.
 * @param title The title of the task
 * @param assigneeProfilePicture The profile picture of the assignee
 */
const TaskCard = ({ title, description }: TaskCardProps) => (
  <Card variant="outlined">
    <CardHeader title={title} />
    <CardContent>
      <p>{description}</p>

      <Stack>
        <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
      </Stack>
    </CardContent>
  </Card>
);

export default TaskCard;
