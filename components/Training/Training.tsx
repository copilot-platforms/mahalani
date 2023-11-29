import { makeStyles } from '../../utils/makeStyles';

const LifestyleTrainingDoc =
  'https://docs.google.com/presentation/d/e/2PACX-1vR6-XC4nSj5WiyGvr_FMY3uZ_I3Bgl8uxIj7t5SLbpdFVG3nwFAhFolHd1QtU2BwIImxjsDvURk1WtM/embed?start=false&loop=false&delayms=60000';
const PremierTrainingDoc =
  'https://docs.google.com/presentation/d/e/2PACX-1vQ2feJyRcMtxGOE5o61iNMk2Thi1eMyhF8C4Oko-dMS7n8m4OnWxklRVRSLrXB1T-EDw8Vdn3vcTRkX/embed?start=false&loop=false&delayms=60000';

type TrainingType = 'lc' | 'pc';

const useStyles = makeStyles()(() => ({
  container: {
    position:'absolute',
    height: '100%',
    width: '100%',
  },
}));

export function Training({ trainingType }: { trainingType: TrainingType }) {
  const { classes } = useStyles();
  return (
    <div className={classes.container}>
      <iframe
        src={trainingType === 'lc' ? LifestyleTrainingDoc : PremierTrainingDoc}
        height="100%"
        width="100%"
      ></iframe>
    </div>
  );
}
