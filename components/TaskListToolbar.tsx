import { IconButton, Input, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { TodoListViewMode } from './types';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
const useStyles = makeStyles(() => ({
  root: {
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    height: '40px',
    border: '1px solid #E5E5E5',
    borderRadius: '4px',
    alignItems: 'center',
    boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.07)',
  },
  toolbarActions: {
    display: 'flex',
    alignItems: 'center',
  },
  inputRoot: {
    '& .MuiOutlinedInput-input': {
      padding: '2px 8px',
      height: 28,
    },
  },
}));
export const TaskListToolbar = ({
  onToggleView,
  title,
  viewMode,
}: {
  onToggleView: (ev: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
  viewMode: TodoListViewMode;
}) => {
  const classes = useStyles();
  const IconComponent =
    viewMode === TodoListViewMode.Board
      ? ListOutlinedIcon
      : ViewWeekOutlinedIcon;
  return (
    <div className={classes.root}>
      <h3>{title}'s tasks</h3>

      <div className={classes.toolbarActions}>
        <TextField
          placeholder="search"
          variant="outlined"
          size="small"
          classes={{
            root: classes.inputRoot,
          }}
        />

        <IconButton onClick={onToggleView}>
          <IconComponent />
        </IconButton>
      </div>
    </div>
  );
};
