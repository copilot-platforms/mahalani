import { makeStyles } from '../../utils/makeStyles';

const LifestyleCollectionForm =
  'https://www.getfeedback.com/r/eY0V8Q6D/';
const PremierCollectionForm =
  'https://www.getfeedback.com/r/uOvgaHrE/';

type FormType = 'lc' | 'pc';

const useStyles = makeStyles()(() => ({
  container: {
    position:'absolute',
    height: '100%',
    width: '100%',
  },
}));

export function CollectionForm({ formType }: { formType: FormType }) {
  const { classes } = useStyles();
  return (
    <div className={classes.container}>
      <iframe
        src={formType === 'lc' ? LifestyleCollectionForm : PremierCollectionForm}
        height="100%"
        width="100%"
      ></iframe>
    </div>
  );
}
