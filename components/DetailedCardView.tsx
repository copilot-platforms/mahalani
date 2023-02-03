import {
  Button,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  css,
} from '@mui/material';
import { Task } from './types';

type DetailedCardViewProps = {
  task: Task;
};

// when a task has no image, we use this placeholder image
const placeholderImage =
  'https://raw.githubusercontent.com/koehlersimon/fallback/master/Resources/Public/Images/placeholder.jpg';

const getImageFromAttachment = (task: Task) => {
  if (!task.attachments) {
    return null;
  }

  const imageAttachment = task.attachments.find((a) =>
    a.type.startsWith('image'),
  );
  if (!imageAttachment) {
    return null;
  }

  return imageAttachment.url;
};

export const DetailedCardView = ({ task }: DetailedCardViewProps) => {
  const { title, description, learnMoreLink } = task;
  const imageUrl = getImageFromAttachment(task);

  return (
    <Card
      css={css`
        width: 500px;
      `}
    >
      <CardMedia
        component="img"
        alt={`title - image`}
        height="300"
        width="500"
        image={imageUrl || placeholderImage}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Details: {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: 'pre-wrap' }}
        >
          {description}
        </Typography>
      </CardContent>
      {learnMoreLink && (
        <CardActions>
          <Button size="small" href={learnMoreLink}>
            Learn More
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
