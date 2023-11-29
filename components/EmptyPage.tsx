import { makeStyles } from '../utils/makeStyles';

const useStyles = makeStyles()(() => ({
  container: {
    height: '100%',
    width: '100%',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
  },
}));

type Props = {
  title: string;
  description: string;
};

export function EmptyPage({ title, description }: Props) {
  const { classes } = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.title}>{title}</div>
      <div className={classes.description}>{description}</div>
    </div>
  );
}
