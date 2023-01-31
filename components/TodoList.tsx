import { Grid, IconButton } from '@mui/material';
import TaskCard from './TaskCard';
import TaskColumn from './TaskColumn';
import { Task, TaskStatus, TodoListViewMode } from './types';
import { useContext, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AirtableContext } from '../utils/airtableContext';
import { getAirtableClient, updateRecord } from '../utils/airtableUtils';
import { makeStyles } from '@mui/styles';
import { TaskListToolbar } from './TaskListToolbar';
const TaskStatuses = [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done];
type DroppedTaskCardData = { taskId: string };
const initialTasksByStatus: Record<TaskStatus, Array<Task>> = {
  [TaskStatus.Todo]: [],
  [TaskStatus.InProgress]: [],
  [TaskStatus.Done]: [],
};

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
}));

const TodoList: React.FC<{ tasks: Array<Task>; title: string }> = ({
  tasks,
  title,
}) => {
  const appSetupData = useContext(AirtableContext);
  const classes = useStyles();
  // Get the airtable rest client instance
  const airtableClient = getAirtableClient(
    appSetupData.apiKey,
    appSetupData.baseId,
  );
  const [listViewMode, setListViewMode] = useState<TodoListViewMode>(
    TodoListViewMode.Board,
  );

  const isListViewMode = listViewMode === TodoListViewMode.List;

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
  const handleStatusChanged = async (
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

    const tableClient = airtableClient(appSetupData.tableId);

    try {
      await updateRecord(tableClient, id, {
        Status: newStatus,
      });
    } catch (ex) {
      console.error('Error updating record', ex);
    }
  };

  /**
   * When a task card is dropped, call handleStatusChanged to
   * update the status of the task.
   * @param param0
   * @param newTaskStatus
   */
  const handleDropTaskCard = (
    { taskId }: DroppedTaskCardData,
    newTaskStatus: TaskStatus,
  ) => {
    const existingStatus = Object.keys(tasksByStatus).find((key) =>
      tasksByStatus[key as TaskStatus].find((task) => task.id === taskId),
    ) as TaskStatus;
    handleStatusChanged(taskId, existingStatus, newTaskStatus);
  };

  /**
   * Toggle between list and board view.
   */
  const handleToggleView = () => {
    setListViewMode((prevView) =>
      prevView === TodoListViewMode.Board
        ? TodoListViewMode.List
        : TodoListViewMode.Board,
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={classes.root}>
        <TaskListToolbar
          title={title}
          onToggleView={handleToggleView}
          viewMode={listViewMode}
        />
        <Grid container gap={0} justifyContent="center">
          {Object.entries(tasksByStatus).map(([status, tasks]) => (
            <Grid item xs={12} md={isListViewMode ? 12 : 4} key={status}>
              <TaskColumn
                viewMode={listViewMode}
                title={status}
                onDrop={(item) => {
                  handleDropTaskCard(item, status as TaskStatus);
                }}
              >
                {tasks.map(({ title, assignee, description, status, id }) => (
                  <TaskCard
                    viewMode={listViewMode}
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
      </div>
    </DndProvider>
  );
};

export default TodoList;
