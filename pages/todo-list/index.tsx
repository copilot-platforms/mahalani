import { Card, Grid } from '@mui/material';
import Link from 'next/link';
import Layout from '../../components/Layout';
import TaskCard from '../../components/TaskCard';
import TaskColumn from '../../components/TaskColumn';
import { TaskStatus } from '../../components/types';
import { tasksSampleData } from '../../utils/tasksData';

const TodoList = () => {
  const todoTasks = tasksSampleData.filter(
    (task) => task.status === TaskStatus.Todo,
  );
  const inProgressTasks = tasksSampleData.filter(
    (task) => task.status === TaskStatus.InProgress,
  );
  const doneTasks = tasksSampleData.filter(
    (task) => task.status === TaskStatus.Done,
  );

  return (
    <Layout title="About | Next.js + TypeScript Example">
      <Grid container gap={1} spacing={0}>
        <Grid item xs={3}>
          <TaskColumn title="Todo">
            {todoTasks.map(
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
    </Layout>
  );
};

export default TodoList;
