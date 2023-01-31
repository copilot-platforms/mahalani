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
import { MoreHoriz } from '@mui/icons-material';

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
});
interface TaskCardProps extends Task {
  onStatusChange: (status: TaskStatus) => void;
}

const StatusToColorMap = {
  [TaskStatus.Todo]: 'primary',
  [TaskStatus.InProgress]: 'warning',
  [TaskStatus.Done]: 'success',
};

/**
 * This component represents the task card.
 * @param title The title of the task
 * @param assigneeProfilePicture The profile picture of the assignee
 */
const TaskCard = ({ title, status, id, onStatusChange }: TaskCardProps) => {
  const classes = useStyles();
  const handleStatusChange = async (event: SelectChangeEvent) => {
    onStatusChange(event.target.value as TaskStatus);
  };

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<HTMLDivElement | null>(
    null,
  );

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
          <IconButton>
            <MoreHoriz />
          </IconButton>
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
