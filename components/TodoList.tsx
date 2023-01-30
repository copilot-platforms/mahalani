import { Card, Grid } from '@mui/material';
import Layout from './Layout';
import TaskCard from './TaskCard';
import TaskColumn from './TaskColumn';
import { Task, TaskStatus } from './types';
import { useMemo } from 'react';

const TodoList: React.FC<{ tasks: Array<Task> }> = ({ tasks }) => {
  const todoTasks = useMemo(
    () => tasks.filter((task) => task.status === TaskStatus.Todo),
    [tasks],
  );
  const inProgressTasks = useMemo(
    () => tasks.filter((task) => task.status === TaskStatus.InProgress),
    [tasks],
  );
  const doneTasks = useMemo(
    () => tasks.filter((task) => task.status === TaskStatus.Done),
    [tasks],
  );

  return (
    <Grid container gap={1} spacing={0}>
      <Grid item xs={3}>
        <TaskColumn title="Todo">
          {todoTasks.map(({ title, assignee, description, status }) => (
            <TaskCard
              key={title}
              title={title}
              assignee={assignee}
              description={description}
              status={status}
            />
          ))}
        </TaskColumn>
      </Grid>
      <Grid item xs={3}>
        <TaskColumn title="In progress">
          {inProgressTasks.map(
            ({ title, assigneeProfilePicture, description, status }) => (
              <TaskCard
                key={title}
                title={title}
                assigneeProfilePicture={assigneeProfilePicture}
                description={description}
                status={status}
              />
            ),
          )}
        </TaskColumn>
      </Grid>
      <Grid item xs={3}>
        <TaskColumn title="Done">
          {doneTasks.map(
            ({ title, assigneeProfilePicture, description, status }) => (
              <TaskCard
                key={title}
                title={title}
                assigneeProfilePicture={assigneeProfilePicture}
                description={description}
                status={status}
              />
            ),
          )}
        </TaskColumn>
      </Grid>
    </Grid>
  );
};

export default TodoList;
