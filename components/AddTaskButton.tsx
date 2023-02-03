import { Button, Card, css, Typography } from '@mui/material';

export const AddTaskButton = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      disableRipple
      css={css`
        width: 100%;
        padding: 10px;
        background-color: #fff;
        cursor: pointer;
        border-radius: 5px;
        border: 1px dashed lightgray;
        justify-content: center;
        display: 'flex';
        align-items: center;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
      `}
    >
      <Typography
        css={css`
          color: #9e9e9e;
          font-size: 14px;
          font-weight: 500;
        `}
        component="span"
      >
        Add task
      </Typography>
    </Button>
  );
};
