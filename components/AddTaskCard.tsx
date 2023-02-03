import { Card, css, TextField } from '@mui/material';
import { makeStyles } from '../utils/makeStyles';
import { Task, TaskStatus } from './types';

// const useStyles = makeStyles()((theme) => ({
//   input: {
//     '& .MuiOutlinedInput-input': {
//       padding: '10px 14px',
//     },
//   },
// }));

export const AddTaskCardForm = ({
  onAddTask,
  columnStatus,
}: {
  onAddTask: (task: Task) => void;
  columnStatus: TaskStatus;
}) => {
  // const { classes } = useStyles();
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
        // classes={{
        //   root: classes.input,
        // }}
        placeholder="Task title here..."
        variant="outlined"
        size="small"
        fullWidth
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAddTask({
              title: e.target.value,
              status: columnStatus,
            });
          }
        }}
      />
    </Card>
  );
};
