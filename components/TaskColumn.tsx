import React from 'react';
import { useDrop } from 'react-dnd';

const taskColumnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

type Props = {
  title: string;
  onDrop: (item: { taskId: string }) => void;
};

/**
 * This component is used to wrap the task cards in a column.
 * @param title The title of the column e.g "Todo", "In progress", "Done"
 */
const TaskColumn: React.FC<Props> = ({ children, title, onDrop }) => {
  const [{ isOver, canDrop }, dropAreaRef] = useDrop({
    accept: 'card',
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  let columnBorder = '#fff';
  if (isActive) {
    columnBorder = '1px dashed lightgreen';
  } else if (canDrop) {
    columnBorder = '1px dashed gray';
  }

  return (
    <div
      ref={dropAreaRef}
      style={{
        ...taskColumnStyle,
        border: columnBorder,
        height: '100%',
        padding: '1rem',
      }}
    >
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default TaskColumn;
