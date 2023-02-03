import { Card, css, TextField } from '@mui/material';
import { useRef } from 'react';
import { Task, TaskStatus } from './types';

export const AddTaskCardForm = ({
  onAddTask,
  columnStatus,
}: {
  onAddTask: (task: Task) => void;
  columnStatus: TaskStatus;
}) => {
  const errorText = useRef('');
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
        onBlur={() => {
          errorText.current = '';
        }}
        helperText={
          errorText.current ? (
            <span
              css={css`
                color: red;
              `}
            >
              {errorText.current}
            </span>
          ) : (
            'Press Enter to add task'
          )
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (!(e.target as HTMLInputElement).value) {
              errorText.current = 'Task title is required';
              return;
            }
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
