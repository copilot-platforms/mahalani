import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Menu,
  IconButton,
} from '@mui/material';
import { Task, TaskStatus } from './types';
import { useDrag } from 'react-dnd';
import { makeStyles } from '@mui/styles';
import {
  SignalCellularAlt1Bar,
  SignalCellularAlt2Bar,
} from '@mui/icons-material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';

type ChipColor =
  | 'primary'
  | 'warning'
  | 'success'
  | 'default'
  | 'secondary'
  | 'error'
  | 'info';
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
    fontSize: '16px',
    fontWeight: 'bold',
  },
  progressChip: {
    width: '90px',
    height: '20px',
  },
  menuPaper: {
    border: '1px solid #E5E5E5',
  },
});
interface TaskCardProps extends Task {
  onStatusChange: (status: TaskStatus) => void;
}

const StatusToColorMap = {
  [TaskStatus.Todo]: 'primary',
  [TaskStatus.InProgress]: 'warning',
  [TaskStatus.Done]: 'success',
};

enum TaskPriority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

const PriorityToComponentMap = {
  High: <SignalCellularAltIcon />,
  Medium: <SignalCellularAlt1Bar />,
  Low: <SignalCellularAlt1Bar />,
};

/**
 * This component represents the task card.
 * @param title The title of the task
 * @param assigneeProfilePicture The profile picture of the assignee
 */
const TaskCard = ({ title, status, id, onStatusChange }: TaskCardProps) => {
  const classes = useStyles();
  const [taskPriority, setTaskPriority] = React.useState('High');
  const handleStatusChange = async (event: SelectChangeEvent) => {
    onStatusChange(event.target.value as TaskStatus);
  };

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<HTMLDivElement | null>(
    null,
  );
  const [taskCardMenu, setCardMenuAnchorEl] =
    React.useState<HTMLDivElement | null>(null);

  const priorityIconComponent = PriorityToComponentMap[taskPriority];

  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: 'card',
      item: { taskId: id },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    [],
  );

  const openTaskCardMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCardMenuAnchorEl(event.currentTarget);
  };
  return (
    <Card
      variant="outlined"
      ref={dragRef}
      style={{ opacity }}
      classes={{
        root: classes.card,
      }}
      component="div"
    >
      <CardHeader
        classes={{ title: classes.cardTitle, root: classes.cardHeader }}
        title={title}
        action={
          <>
            <IconButton onClick={openTaskCardMenu}>
              {priorityIconComponent}
            </IconButton>
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
          </>
        }
      />
      <CardContent>
        <Stack>
          <Chip
            color={StatusToColorMap[status] as ChipColor}
            label={status}
            classes={{ root: classes.progressChip }}
            onClick={(event) => {
              setMenuAnchorEl(event.currentTarget);
            }}
          />
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
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
