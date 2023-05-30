import { Container, Box, Grid, Typography, Dialog } from '@mui/material';
import TaskCard from './TaskCard';
import TaskColumn from './TaskColumn';
import { Task, TaskStatus, TodoListViewMode } from './types';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TaskListToolbar } from './TaskListToolbar';
import { FilterTodoListDialog } from './FilterTodoListDialog';
import clsx from 'clsx';
import { makeStyles } from '../utils/makeStyles';
import { AddTaskButton } from './AddTaskButton';
import { AddTaskCardForm } from './AddTaskCard';
import { DetailedCardView } from './DetailedCardView';
import { useRouter } from 'next/router';
import { AppContext } from '../utils/appContext';

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
  dialogRoot: {
    zIndex: 2,
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
  onUpdateAction: (id: string) => void;
}> = ({ tasks, title, onUpdateAction }) => {
  const router = useRouter();
  const { appId, clientId } = router.query;
  const { classes } = useStyles();
  const appConfig = useContext(AppContext);
  // Get the current client airtable record ref which lives in the tasks
  const clientIdRef = tasks[0]?.clientIdRef;
  const [listViewMode, setListViewMode] = useState<TodoListViewMode>(
    TodoListViewMode.Board,
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task>(null);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const isListViewMode = listViewMode === TodoListViewMode.List;

  const [tasksByStatus, setTasksByStatus] =
    useState<Record<TaskStatus, Array<Task>>>(initialTasksByStatus);
  const [showAddTaskForm, setShowAddTaskForm] = useState<
    Record<TaskStatus, boolean>
  >({
    [TaskStatus.Todo]: false,
    [TaskStatus.InProgress]: false,
    [TaskStatus.Done]: false,
  });
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

  const controller = useRef<AbortController | null>(null);
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
    if (controller.current) controller.current.abort();
    controller.current = new AbortController();
    const existingTasks = tasksByStatus[existingStatus];
    const newTasks = tasksByStatus[newStatus];
    const taskToMove = existingTasks?.find((task) => task.id === id);

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
      [newStatus]: [...newTasks, { ...taskToMove, status: newStatus }].sort(
        (a, b) => a.rank - b.rank,
      ),
    };

    setTasksByStatus(updatedTasks);

    onUpdateAction(id);
    try {
      await fetch(`/api/data?appId=${appId}&recordId=${id}`, {
        method: 'PATCH',
        signal: controller.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Status: newStatus,
        }),
      });
      controller.current = null;
    } catch (ex) {
      console.error('Error updating record', ex);
    } finally {
      onUpdateAction(id);
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
  const handleTaskOpen = (taskId: string, status: string) => {
    // when task is selected we should set the state for the currently select task and use that
    // to show the dialog
    // 1. Use status to get same status task from 'taskByStatus' state
    // 2. Use taskId is get the selected task from the step 1 array list
    setSelectedTask(
      tasksByStatus[status]?.find((t) => t.id === taskId) || null,
    );
  };

  /**
   * Add event listeners for keyboard shortcuts.
   * Escape key closes the filter dialog.
   * Command + F opens the filter dialog.
   * Command + B toggles between board view & list view.
   */
  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setOpenFilterDialog(false);
        setShowAddTaskForm({
          [TaskStatus.Todo]: false,
          [TaskStatus.InProgress]: false,
          [TaskStatus.Done]: false,
        });
      }

      if (e.key === 'f' && e.metaKey) {
        e.preventDefault();
        setOpenFilterDialog(true);
      }

      // if (e.key === 'b' && e.metaKey) {
      //   e.preventDefault();
      //   handleToggleView();
      // }

      // if (e.key === 'u' && e.metaKey) {
      //   e.preventDefault();
      //   setShowAddTaskForm((currentState) => ({
      //     ...currentState,
      //     [TaskStatus.Todo]: true,
      //   }));
      // }

      // if (e.key === 'i' && e.metaKey) {
      //   e.preventDefault();
      //   setShowAddTaskForm((currentState) => ({
      //     ...currentState,
      //     [TaskStatus.InProgress]: true,
      //   }));
      // }

      // if (e.key === 'd' && e.metaKey) {
      //   e.preventDefault();
      //   setShowAddTaskForm((currentState) => ({
      //     ...currentState,
      //     [TaskStatus.Done]: true,
      //   }));
      // }
    });

    return () => {
      window.removeEventListener('keydown', () => {});
    };
  }, []);

  const handleEditDescription = async (taskId: string, description: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      return;
    }

    const updatedTask = {
      ...task,
      description,
    };

    setSelectedTask(updatedTask);
    setTasksByStatus((currentState) => ({
      ...currentState,
      [task.status]: currentState[task.status].map((t) =>
        t.id === taskId ? updatedTask : t,
      ),
    }));

    console.info('tasksByStatus', tasksByStatus);
    onUpdateAction(taskId);
    try {
      await fetch(`/api/data?appId=${appId}&recordId=${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Description: description,
        }),
      });
      // close details update modal
      setSelectedTask(null);
    } catch (ex) {
      console.error('Error updating record', ex);
    } finally {
      onUpdateAction(taskId);
    }
  };

  /**
   * Filter the tasks by title using the searchFilter.
   */
  useEffect(() => {
    // filter task by title
    const filteredTasks = tasks.filter(
      (task) =>
        task.title &&
        task.title.toLowerCase().includes(searchFilter.toLowerCase()),
    );

    setTasksByStatus(
      TaskStatuses.reduce((acc, status) => {
        acc[status] = filteredTasks.filter((task) => task.status === status);
        return acc;
      }, {} as Record<TaskStatus, Array<Task>>),
    );
  }, [searchFilter]);

  // when there is no task & client can't add tasks, show empty state
  if (tasks.length === 0 && !appConfig.controls?.allowAddingItems) {
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

  const handleAddTaskClick = (columnStatus: TaskStatus) => {
    setShowAddTaskForm((currentState) => ({
      ...currentState,
      [columnStatus]: true,
    }));
  };

  const handleAddTask = async (newTask: Task) => {
    setTasksByStatus((currentState) => ({
      ...currentState,
      [newTask.status]: [...currentState[newTask.status], newTask],
    }));

    setShowAddTaskForm((currentState) => ({
      ...currentState,
      [newTask.status]: false,
    }));

    const pendingRequestId = Date.now().toString();
    try {
      onUpdateAction(pendingRequestId);
      await fetch(`/api/data?appId=${appId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: newTask.title,
          Status: newTask.status,
          'Assignee - Reference Record': clientIdRef,
          'Assignee ID': clientId,
        }),
      });
    } catch (error) {
      console.error('Error adding record', error);
    } finally {
      onUpdateAction(pendingRequestId);
    }
  };

  return (
    <>
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
                          rank,
                        }) => (
                          <>
                            <TaskCard
                              viewMode={listViewMode}
                              key={title}
                              title={title}
                              rank={rank}
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
                        {showAddTaskForm[status] && (
                          <AddTaskCardForm
                            onAddTask={handleAddTask}
                            columnStatus={status as TaskStatus}
                          />
                        )}
                        {appConfig.controls?.allowAddingItems && (
                          <AddTaskButton
                            onClick={() => {
                              handleAddTaskClick(status as TaskStatus);
                            }}
                          />
                        )}
                      </>
                    </TaskColumn>
                  </Grid>
                ))}
              </Grid>
            </div>
          </TodoListFilterContext.Provider>
        </DndProvider>
      </div>
      {selectedTask && (
        <Dialog
          classes={{
            root: classes.dialogRoot,
          }}
          open
          onClose={() => setSelectedTask(null)}
        >
          <DetailedCardView
            task={selectedTask}
            onEditDescription={(newDescription: string) =>
              handleEditDescription(selectedTask.id, newDescription)
            }
          />
        </Dialog>
      )}
    </>
  );
};

export default TodoList;
