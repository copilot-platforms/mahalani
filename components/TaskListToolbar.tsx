import { ButtonGroup, Divider, IconButton, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { TodoListViewMode } from './types';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import { FilterListOffOutlined } from '@mui/icons-material';
import { useContext } from 'react';
import { TodoListFilterContext } from './TodoList';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(1, 2),
    display: 'flex',
    justifyContent: 'space-between',
    height: '40px',
    border: '1px solid #E5E5E5',
    borderRadius: theme.shape.borderRadius,
    alignItems: 'center',
    boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.07)',
  },
}));
export const TaskListToolbar = ({
  onToggleViewClick,
  onFilterClick,
  title,
  viewMode,
}: {
  onToggleViewClick: (ev: React.MouseEvent<HTMLButtonElement>) => void;
  onFilterClick: (ev: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
  viewMode: TodoListViewMode;
}) => {
  const classes = useStyles();
  const { filter: searchTerm, setFilter } = useContext(TodoListFilterContext);

  const todoListHasFilter = searchTerm && searchTerm.length > 0;

  const FilterIconComponent = !todoListHasFilter
    ? FilterListOutlinedIcon
    : FilterListOffOutlined;

  const onFilterIconClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
    if (todoListHasFilter) {
      setFilter('');
    } else {
      onFilterClick(ev);
    }
  };

  return (
    <div className={classes.root}>
      <h3>{title}</h3>

      <ButtonGroup>
        <IconButton
          disableRipple
          disabled={viewMode === TodoListViewMode.List}
          onClick={onToggleViewClick}
        >
          <ListOutlinedIcon />
        </IconButton>

        <IconButton
          disableRipple
          disabled={viewMode === TodoListViewMode.Board}
          onClick={onToggleViewClick}
        >
          <ViewWeekOutlinedIcon />
        </IconButton>

        <Divider orientation="vertical" flexItem />

        <IconButton disableRipple onClick={onFilterIconClick}>
          <FilterIconComponent />
        </IconButton>
      </ButtonGroup>
    </div>
  );
};
