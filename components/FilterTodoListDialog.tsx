import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import { TextField } from '@mui/material';
import { TodoListFilterContext } from './TodoList';

export interface FilerTodoListDialogProps {
  open: boolean;
  onClose: (value: string) => void;
}

export function FilerTodoListDialog(props: FilerTodoListDialogProps) {
  const { onClose, open } = props;
  const { filter: searchFilter, setFilter } = React.useContext(
    TodoListFilterContext,
  );
  const handleSearchChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const val = ev.target.value;
    setFilter(val);
  };

  /**
   * handles the enter or escape keystrokes for the search input
   * @param ev : React.KeyboardEvent<HTMLInputElement>
   */
  const handleSearchKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    // when the user presses enter, persist the search val
    // and close the dialog
    if (ev.key === 'Enter') {
      setFilter(searchFilter);
      onClose(searchFilter);
    }

    // when the user presses escape, clear the search val
    // and close the dialog
    if (ev.key === 'Escape') {
      setFilter('');
      onClose('');
    }
  };

  return (
    <Dialog onClose={onClose} open={open} hideBackdrop disablePortal>
      <TextField
        placeholder="Find in view ..."
        style={{
          width: '380px',
        }}
        value={searchFilter}
        onChange={handleSearchChange}
        onKeyDown={handleSearchKeyDown}
        autoFocus
        helperText="Press enter to apply filter, escape to clear"
      />
    </Dialog>
  );
}
