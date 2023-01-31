import { Card, Grid } from '@mui/material';
import Layout from './Layout';
import TaskCard from './TaskCard';
import TaskColumn from './TaskColumn';
import { Task, TaskStatus } from './types';
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const TaskStatuses = [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done];

const initialTasksByStatus: Record<TaskStatus, Array<Task>> = {
  [TaskStatus.Todo]: [],
  [TaskStatus.InProgress]: [],
  [TaskStatus.Done]: [],
};

const TodoList: React.FC<{ tasks: Array<Task> }> = ({ tasks }) => {
  const [tasksByStatus, setTasksByStatus] =
    useState<Record<TaskStatus, Array<Task>>>(initialTasksByStatus);

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
  const handleStatusChanged = (
    id: string,
    existingStatus: TaskStatus,
    newStatus: TaskStatus,
  ) => {
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

  const handleDropTaskCard = (
    { taskId }: { taskId: string },
    newTaskStatus: TaskStatus,
  ) => {
    const existingStatus = Object.keys(tasksByStatus).find((key) =>
      tasksByStatus[key as TaskStatus].find((task) => task.id === taskId),
    ) as TaskStatus;
    handleStatusChanged(taskId, existingStatus, newTaskStatus);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Grid container gap={1} spacing={0}>
        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <Grid item xs={3} key={status}>
            <TaskColumn
              title={status}
              onDrop={(item) => {
                handleDropTaskCard(item, status as TaskStatus);
              }}
            >
              {tasks.map(({ title, assignee, description, status, id }) => (
                <TaskCard
                  key={title}
                  title={title}
                  assignee={assignee}
                  description={description}
                  status={status}
                  id={id}
                  onStatusChange={(newStatus: TaskStatus) =>
                    handleStatusChanged(id, status, newStatus)
                  }
                />
              ))}
            </TaskColumn>
          </Grid>
        ))}
      </Grid>
    </DndProvider>
  );
};

export default TodoList;
