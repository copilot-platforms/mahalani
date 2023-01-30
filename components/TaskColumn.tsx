import React from 'react';

const taskColumnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

type Props = {
  title: string;
};

/**
 * This component is used to wrap the task cards in a column.
 * @param title The title of the column e.g "Todo", "In progress", "Done"
 */
const TaskColumn: React.FC<Props> = ({ children, title }) => (
  <div style={taskColumnStyle}>
    <h2>{title}</h2>
    {children}
  </div>
);

export default TaskColumn;
