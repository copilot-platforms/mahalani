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

  return (
    <Dialog onClose={onClose} open={open} hideBackdrop disablePortal>
      <TextField
        placeholder="Find in view ..."
        style={{
          width: '380px',
        }}
        value={searchFilter}
        onChange={handleSearchChange}
        onKeyDown={(ev) => {
          // when the user presses enter, persist the search val
          // and close the dialog
          if (ev.key === 'Enter') {
            setFilter(searchFilter);
            onClose(searchFilter);
          }
        }}
        autoFocus
      />
    </Dialog>
  );
}
