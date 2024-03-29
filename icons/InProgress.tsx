import { SvgIcon, SvgIconProps } from '@mui/material';

export const InProgressIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-label="In Progress"
      {...props}
    >
      <rect
        x="1"
        y="1"
        width="12"
        height="12"
        rx="6"
        stroke="#f2c94c"
        strokeWidth="2"
        fill="none"
      ></rect>
      <path
        fill="#f2c94c"
        stroke="none"
        d="M 3.5,3.5 L3.5,0 A3.5,3.5 0 0,1 3.5, 7 z"
        transform="translate(3.5,3.5)"
      ></path>
    </SvgIcon>
  );
};
