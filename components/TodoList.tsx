import { Divider, Grid, IconButton, Theme, Typography } from '@mui/material';
import TaskCard from './TaskCard';
import TaskColumn from './TaskColumn';
import { Task, TaskStatus, TodoListViewMode } from './types';
import { createContext, useContext, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AirtableContext } from '../utils/airtableContext';
import { getAirtableClient, updateRecord } from '../utils/airtableUtils';
import { makeStyles } from '@mui/styles';
import { TaskListToolbar } from './TaskListToolbar';
import { FilerTodoListDialog } from './FilterTodoListDialog';
import clsx from 'clsx';
const TaskStatuses = [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done];
type DroppedTaskCardData = { taskId: string };
const initialTasksByStatus: Record<TaskStatus, Array<Task>> = {
  [TaskStatus.Todo]: [],
  [TaskStatus.InProgress]: [],
  [TaskStatus.Done]: [],
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  listViewContainer: {
    padding: '0 10px',
    [theme.breakpoints.up('lg')]: {
      padding: '0 200px',
    },
    [theme.breakpoints.up('xl')]: {
      padding: '0 400px',
    },
  },
}));
export const TodoListFilterContext = createContext<{
  filter: string;
  setFilter: (filter: string) => void;
}>({
  filter: '',
  setFilter: () => {},
});

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

    // if the status is the same, do nothing
    if (existingStatus === newStatus) {
      return;
    }
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

  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  /**
   * Add event listeners for keyboard shortcuts.
   * Escape key closes the filter dialog.
   * Command + F opens the filter dialog.
   * Command + B toggles to board view.
   * Command + L toggles to list view.
   */
  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setOpenFilterDialog(false);
      }

      if (e.key === 'f' && e.metaKey) {
        e.preventDefault();
        setOpenFilterDialog(true);
      }

      if (e.key === 'b' && e.metaKey) {
        setListViewMode(TodoListViewMode.Board);
      }

      if (e.key === 'l' && e.metaKey) {
        setListViewMode(TodoListViewMode.List);
      }
    });

    return () => {
      window.removeEventListener('keydown', () => {});
    };
  }, []);

  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    // filter task by title
    const filteredTasks = tasks.filter((task) =>
      task.title.toLowerCase().includes(searchFilter.toLowerCase()),
    );

    setTasksByStatus(
      TaskStatuses.reduce((acc, status) => {
        acc[status] = filteredTasks.filter((task) => task.status === status);
        return acc;
      }, {} as Record<TaskStatus, Array<Task>>),
    );
  }, [searchFilter]);

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <TodoListFilterContext.Provider
          value={{
            filter: searchFilter,
            setFilter: setSearchFilter,
          }}
        >
          <FilerTodoListDialog
            open={openFilterDialog}
            onClose={() => {
              setOpenFilterDialog(false);
            }}
          />
          <div className={classes.root}>
            <TaskListToolbar
              title={title}
              onToggleViewClick={handleToggleView}
              onFilterClick={() => {
                setOpenFilterDialog(true);
              }}
              viewMode={listViewMode}
            />

            <Grid
              container
              mt={2}
              gap={2}
              justifyContent="center"
              height={1}
              className={clsx({
                [classes.listViewContainer]: isListViewMode,
              })}
            >
              {Object.entries(tasksByStatus).map(([status, tasks]) => (
                <Grid item xs={12} md={isListViewMode ? 12 : 3} key={status}>
                  <TaskColumn
                    viewMode={listViewMode}
                    title={status}
                    onDrop={(item) => {
                      handleDropTaskCard(item, status as TaskStatus);
                    }}
                  >
                    {tasks.length === 0 && Boolean(searchFilter) && (
                      <Typography variant="body2" color="textSecondary">
                        No {status.toLowerCase()} tasks found
                      </Typography>
                    )}
                    {tasks.map(
                      ({ title, assignee, description, status, id }) => (
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
                      ),
                    )}
                  </TaskColumn>
                </Grid>
              ))}
            </Grid>
          </div>
        </TodoListFilterContext.Provider>
      </DndProvider>
    </div>
  );
};

export default TodoList;
