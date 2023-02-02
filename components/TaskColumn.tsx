import React from 'react';
import { useDrop } from 'react-dnd';
import { TodoListViewMode } from './types';
import { makeStyles } from '@mui/styles';
import { Divider } from '@mui/material';
import clsx from 'clsx';
const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    padding: '1rem',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: '#fafafa',
  },
  columnTitle: { margin: 0 },
  columnActive: {
    border: '1px dashed lightgray',
  },
}));

type Props = {
  title: string;
  viewMode: TodoListViewMode;
  onDrop: (item: { taskId: string }) => void;
  children: React.ReactNode;
};

/**
 * This component is used to wrap the task cards in a column.
 * @param title The title of the column e.g "Todo", "In progress", "Done"
 */
const TaskColumn: React.FC<Props> = ({ children, title, onDrop, viewMode }) => {
  const classes = useStyles();
  const [{ isOver, canDrop, droppingTaskItem }, dropAreaRef] = useDrop({
    accept: 'card',
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      droppingTaskItem: monitor.getItem(),
    }),
  });

  const isActive = isOver && canDrop;

  return (
    <div
      ref={dropAreaRef}
      className={clsx(classes.root, {
        [classes.columnActive]: isActive,
      })}
    >
      <h3 className={classes.columnTitle}>{title}</h3>
      <Divider light />
      {children}

      {
        // when drop is active show a message to the user to drop the card.
        // also, don't show the message if the card is already in the column.
        isActive && (droppingTaskItem as any)?.status !== title && (
          <p style={{ color: 'lightgray' }}>
            Drop the card here to move it to {title}
          </p>
        )
      }
    </div>
  );
};

export default TaskColumn;
