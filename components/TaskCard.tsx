import React, { useContext } from 'react';
import {
  Card,
  MenuItem,
  SelectChangeEvent,
  Menu,
  IconButton,
  Typography,
  ButtonGroup,
  Chip,
  CardContent,
} from '@mui/material';
import { Task, TaskStatus, TodoListViewMode, Priority } from './types';
import { useDrag } from 'react-dnd';
import {
  SignalCellularAlt1Bar,
  SignalCellularAlt2Bar,
} from '@mui/icons-material';
import OpenInFull from '@mui/icons-material/OpenInFull';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import { TodoIcon, InProgressIcon, DoneIcon } from '../icons';
import { makeStyles } from '../utils/makeStyles';
import { Box } from '@mui/system';
import { AppContext } from '../utils/appContext';

const useStyles = makeStyles<{ viewMode: TodoListViewMode }>()((theme) => ({
  card: {
    width: '100%',
    boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.07)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  cardTitle: {
    maxWidth: '80%',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  menuPaper: {
    border: '1px solid #E5E5E5',
  },
  priorityChip: {
    '&.MuiChip-root': {
      height: '20px',
      padding: '0',
      fontSize: '12px',
      '&:hover': {
        cursor: 'default',
      },
    },
  },
}));

interface TaskCardProps extends Task {
  onStatusChange: (status: TaskStatus) => void;
  viewMode: TodoListViewMode;
  onTaskOpen: (id: string) => void;
}

const PriorityToColorMap = {
  High: 'error',
  Medium: 'warning',
  Low: 'success',
};

const PriorityToComponentMap = {
  High: SignalCellularAltIcon,
  Medium: SignalCellularAlt2Bar,
  Low: SignalCellularAlt1Bar,
};

const StatusToIconMap = {
  [TaskStatus.Todo]: TodoIcon,
  [TaskStatus.InProgress]: InProgressIcon,
  [TaskStatus.Done]: DoneIcon,
};

/**
 * This component represents the task card.
 * @param title The title of the task
 * @param assigneeProfilePicture The profile picture of the assignee
 */
const TaskCard = ({
  title,
  status,
  priority,
  id,
  onStatusChange,
  viewMode,
  onTaskOpen,
}: TaskCardProps) => {
  const { classes } = useStyles({ viewMode });
  const appConfig = useContext(AppContext);
  const [taskPriority, setTaskPriority] = React.useState(priority?.toString());
  const handleStatusChange = async (event: SelectChangeEvent) => {
    onStatusChange(event.target.value as TaskStatus);
  };

  const [menuAnchorEl, setMenuAnchorEl] =
    React.useState<HTMLButtonElement | null>(null);
  const [taskCardMenu, setCardMenuAnchorEl] =
    React.useState<HTMLDivElement | null>(null);

  const PriorityIconComponent = PriorityToComponentMap[taskPriority];

  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: 'card',
      item: { taskId: id, status },
      canDrag: appConfig.controls?.allowUpdatingStatus,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    [],
  );

  const StatusIcon = StatusToIconMap[status];

  // TODO: turn this back on once we want to actually allow clients to edit priority
  const openTaskCardMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    return;
  };

  const openTaskCard = () => {
    onTaskOpen(id);
  }

  return (
    <Card
      variant="outlined"
      ref={dragRef}
      classes={{
        root: classes.card,
      }}
      component="div"
      style={{
        opacity: opacity,
      }}
    >
      <CardContent>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {appConfig.controls?.allowUpdatingStatus && (
              <ButtonGroup
                sx={{
                  margin: 'auto 0'
                }}
              >
                <IconButton
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuAnchorEl(event.currentTarget);
                  }}
                >
                  <StatusIcon
                    style={{
                      fontSize: '12px',
                    }}
                  />
                </IconButton>
              </ButtonGroup>
            )}
            {!appConfig.controls?.allowUpdatingStatus && (
              <StatusIcon
                style={{
                  fontSize: '12px',
                }}
              />
            )}
            <div>
              <Typography fontSize={16} component="div">{title}</Typography>
              {priority && (
                <Chip
                  component="button"
                  label={taskPriority}
                  onClick={openTaskCardMenu}
                  color={PriorityToColorMap[taskPriority]}
                  className={classes.priorityChip}
                />
              )}
            </div>
          </Box>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              onTaskOpen(id);
            }}
          >
            <OpenInFull
              style={{
                fontSize: '12px',
              }}
            />
          </IconButton>
        </div>
      </CardContent>

      <Menu
        elevation={0}
        classes={{
          paper: classes.menuPaper,
        }}
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => {
          setMenuAnchorEl(null);
        }}
      >
        {Object.entries(TaskStatus).map(([key, value]) => (
          <MenuItem
            onClick={() => {
              handleStatusChange({
                target: { value: value },
              } as SelectChangeEvent);
            }}
            value={value}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        elevation={0}
        classes={{
          paper: classes.menuPaper,
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 50,
        }}
        open={Boolean(taskCardMenu)}
        anchorEl={taskCardMenu}
        onClose={() => {
          setCardMenuAnchorEl(null);
        }}
      >
        {Object.entries(Priority).map(([key, value]) => (
          <MenuItem
            onClick={() => {
              setTaskPriority(value);
              setCardMenuAnchorEl(null);
            }}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
};

export default TaskCard;
