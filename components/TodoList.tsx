import { Card, Grid } from '@mui/material';
import Layout from './Layout';
import TaskCard from './TaskCard';
import TaskColumn from './TaskColumn';
import { Task, TaskStatus } from './types';
import { useEffect, useMemo, useState } from 'react';

const TaskStatuses = [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done];

const TodoList: React.FC<{ tasks: Array<Task> }> = ({ tasks }) => {
  const [tasksByStatus, setTasksByStatus] = useState<Record<TaskStatus, Array<Task>>>({});

  /**
   * This is a useEffect that filters the tasks by status.
   * Use reduce to convert the array of tasks into an object.
   * Written by: github copilot
   */
  useEffect(() => {
    const filteredTasks = TaskStatuses.reduce((acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    }, {} as Record<TaskStatus, Array<Task>>);
    setTasksByStatus(filteredTasks);
  }, [tasks]);

  /**
   * Move the task from one status to another.
   * @param id task id
   * @param existingStatus existing status
   * @param newStatus new status
   * @returns 
   */
  const handleStatusChanged = (id: string, existingStatus: TaskStatus, newStatus: TaskStatus) => {
    const existingTasks = tasksByStatus[existingStatus];
    const newTasks = tasksByStatus[newStatus];
    const taskToMove = existingTasks.find((task) => task.id === id);

    if (!taskToMove) {
      return;
    }

    const updatedTasks = {
      ...tasksByStatus,
      [existingStatus]: existingTasks.filter((task) => task.id !== id),
      [newStatus]: [...newTasks, { ...taskToMove, status: newStatus }],
    };

    setTasksByStatus(updatedTasks);
  };

  return (
    <Grid container gap={1} spacing={0}>
      {Object.entries(tasksByStatus).map(([status, tasks]) => (
        <Grid item xs={3}>
        <TaskColumn title={status}>
          {tasks.map(({ title, assignee, description, status, id }) => (
            <TaskCard
              key={title}
              title={title}
              assignee={assignee}
              description={description}
              status={status}
              id={id}
              onStatusChange={(newStatus: TaskStatus) => handleStatusChanged(id, status, newStatus)}
            />
          ))}
        </TaskColumn>
      </Grid>
      ))}
    </Grid>
  );
};

export default TodoList;
