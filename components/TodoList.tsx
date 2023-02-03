import {
  Container,
  Box,
  Grid,
  IconButton,
  Theme,
  Typography,
  Dialog,
} from '@mui/material';
import TaskCard from './TaskCard';
import TaskColumn from './TaskColumn';
import { Task, TaskStatus, TodoListViewMode } from './types';
import { createContext, useContext, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AppContext } from '../utils/appContext';
import {
  addRecord,
  getAirtableClient,
  updateRecord,
} from '../utils/airtableUtils';
import { TaskListToolbar } from './TaskListToolbar';
import { FilterTodoListDialog } from './FilterTodoListDialog';
import clsx from 'clsx';
import { makeStyles } from '../utils/makeStyles';
import { AddTaskButton } from './AddTaskButton';
import { AddTaskCardForm } from './AddTaskCard';
import { DetailedCardView } from './DetailedCardView';

const TaskStatuses = [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done];
type DroppedTaskCardData = { taskId: string };
const initialTasksByStatus: Record<TaskStatus, Array<Task>> = {
  [TaskStatus.Todo]: [],
  [TaskStatus.InProgress]: [],
  [TaskStatus.Done]: [],
};

const useStyles = makeStyles()((theme) => ({
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

const TodoList: React.FC<{
  tasks: Array<Task>;
  title: string;
}> = ({ tasks, title }) => {
  const appSetupData = useContext(AppContext);

  // Get the current client airtable record ref which lives in the tasks
  const clientIdRef = tasks[0]?.clientIdRef;

  const { classes } = useStyles();
  // Get the airtable rest client instance
  const airtableClient = getAirtableClient(
    appSetupData.airtableApiKey,
    appSetupData.baseId,
  );

  const tableClient = airtableClient(appSetupData.tableId);

  const [listViewMode, setListViewMode] = useState<TodoListViewMode>(
    TodoListViewMode.Board,
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task>(null);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
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

  /**
   * handle task card opened
   */
  const handleTaskOpen = (taskId: string) => {
    // when a taskId is selected we should set the state for the currently select task and use that
    // to show the dialog
    setSelectedTask(tasks.find((t) => t.id === taskId) || null);
  };

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
        setShowAddTaskOnColumn({
          [TaskStatus.Todo]: false,
          [TaskStatus.InProgress]: false,
          [TaskStatus.Done]: false,
        });
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

      if (e.key === 'u' && e.metaKey) {
        e.preventDefault();
        setShowAddTaskOnColumn((currentState) => ({
          ...currentState,
          [TaskStatus.Todo]: true,
        }));
      }

      if (e.key === 'i' && e.metaKey) {
        e.preventDefault();
        setShowAddTaskOnColumn((currentState) => ({
          ...currentState,
          [TaskStatus.InProgress]: true,
        }));
      }

      if (e.key === 'd' && e.metaKey) {
        e.preventDefault();
        setShowAddTaskOnColumn((currentState) => ({
          ...currentState,
          [TaskStatus.Done]: true,
        }));
      }
    });

    return () => {
      window.removeEventListener('keydown', () => {});
    };
  }, []);

  /**
   * Filter the tasks by title using the searchFilter.
   */
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

  // when there is no task, show empty state
  if (tasks.length === 0) {
    return (
      <Container>
        <Box mt={8}>
          <Typography variant="h4" align="center">
            You have no tasks assigned!
          </Typography>
          <Typography variant="subtitle1" align="center">
            Please come back later to check if new tasks have been assigned.
          </Typography>
        </Box>
      </Container>
    );
  }

  const [showAddTaskOnColumn, setShowAddTaskOnColumn] = useState<
    Record<TaskStatus, boolean>
  >({
    [TaskStatus.Todo]: false,
    [TaskStatus.InProgress]: false,
    [TaskStatus.Done]: false,
  });

  const handleAddTaskClick = (columnStatus: TaskStatus) => {
    setShowAddTaskOnColumn((currentState) => ({
      ...currentState,
      [columnStatus]: true,
    }));
  };

  const handleAddTask = async (newTask: Task) => {
    setTasksByStatus((currentState) => ({
      ...currentState,
      [newTask.status]: [...currentState[newTask.status], newTask],
    }));

    setShowAddTaskOnColumn((currentState) => ({
      ...currentState,
      [newTask.status]: false,
    }));

    try {
      await addRecord(tableClient, {
        Name: newTask.title,
        Status: newTask.status,
        'Relevant Client ID': clientIdRef,
      });
    } catch (error) {
      console.error('Error adding record', error);
    }
  };

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <TodoListFilterContext.Provider
          value={{
            filter: searchFilter,
            setFilter: setSearchFilter,
          }}
        >
          <FilterTodoListDialog
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
                      ({
                        title,
                        assignee,
                        description,
                        status,
                        priority,
                        id,
                      }) => (
                        <>
                          <TaskCard
                            viewMode={listViewMode}
                            key={title}
                            title={title}
                            assignee={assignee}
                            description={description}
                            status={status}
                            priority={priority}
                            onTaskOpen={handleTaskOpen}
                            id={id}
                            onStatusChange={(newStatus: TaskStatus) =>
                              handleStatusChanged(id, status, newStatus)
                            }
                          />
                        </>
                      ),
                    )}
                    <>
                      {showAddTaskOnColumn[status] && (
                        <AddTaskCardForm
                          onAddTask={handleAddTask}
                          columnStatus={status as TaskStatus}
                        />
                      )}
                      <AddTaskButton
                        onClick={() => {
                          handleAddTaskClick(status as TaskStatus);
                        }}
                      />
                    </>
                  </TaskColumn>
                </Grid>
              ))}
            </Grid>
          </div>
        </TodoListFilterContext.Provider>
      </DndProvider>
      {selectedTask && (
        <Dialog open onClose={() => setSelectedTask(null)}>
          <DetailedCardView task={selectedTask} />
        </Dialog>
      )}
    </div>
  );
};

export default TodoList;
