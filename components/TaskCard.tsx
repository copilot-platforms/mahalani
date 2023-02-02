import React from 'react';
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
import { Task, TaskStatus, TodoListViewMode } from './types';
import { useDrag } from 'react-dnd';
import { makeStyles } from '@mui/styles';
import {
  SignalCellularAlt1Bar,
  SignalCellularAlt2Bar,
} from '@mui/icons-material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import { TodoIcon, InProgressIcon, DoneIcon } from '../icons';

const useStyles = makeStyles({
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
    },
  },
});
interface TaskCardProps extends Task {
  onStatusChange: (status: TaskStatus) => void;
  viewMode: TodoListViewMode;
}

const PriorityToColorMap = {
  High: 'error',
  Medium: 'warning',
  Low: 'success',
};

enum TaskPriority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

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
  id,
  onStatusChange,
  viewMode,
}: TaskCardProps) => {
  const classes = useStyles({ viewMode });

  const [taskPriority, setTaskPriority] = React.useState('High');
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
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    [],
  );

  const StatusIcon = StatusToIconMap[status];

  const openTaskCardMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCardMenuAnchorEl(event.currentTarget as any);
  };

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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ButtonGroup>
              <IconButton
                onClick={(event) => {
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

            <Typography fontSize={16}>{title}</Typography>
          </div>
          <Chip
            component="button"
            label={taskPriority}
            onClick={openTaskCardMenu}
            color={PriorityToColorMap[taskPriority]}
            className={classes.priorityChip}
          />
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
        {Object.entries(TaskPriority).map(([key, value]) => (
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
