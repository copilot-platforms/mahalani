import { Card, css, TextField } from '@mui/material';
import { Task, TaskStatus } from './types';

export const AddTaskCardForm = ({
  onAddTask,
  columnStatus,
}: {
  onAddTask: (task: Task) => void;
  columnStatus: TaskStatus;
}) => {
  return (
    <Card
      elevation={0}
      css={css`
        padding: 10px;
        width: 100%;
        display: flex;
        flex-direction: column;
        border-radius: 5px;
        border: 1px dashed lightgray;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
      `}
    >
      <TextField
        placeholder="Task title here..."
        variant="outlined"
        size="small"
        fullWidth
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAddTask({
              title: (e.target as HTMLInputElement).value,
              status: columnStatus,
            });
          }
        }}
      />
    </Card>
  );
};
