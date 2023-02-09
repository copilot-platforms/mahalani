import {
  Button,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  css,
  TextareaAutosize,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { Task } from './types';
import { EditorInput } from './Editor';

type DetailedCardViewProps = {
  task: Task;
  onEditDescription: (description: string) => void;
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

export const DetailedCardView = ({
  task,
  onEditDescription,
}: DetailedCardViewProps) => {
  const { title, description, learnMoreLink } = task;
  const imageUrl = getImageFromAttachment(task);
  const [descriptionInput, setDescriptionInput] = useState(description || '');
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);

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
        <EditorInput
          value={descriptionInput}
          onChange={(data) => {
            setDescriptionInput(data);
            onEditDescription(data);
          }}
        />
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
