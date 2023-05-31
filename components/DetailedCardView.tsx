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
import { useContext, useState } from 'react';
import { Task } from './types';
import { EditorInput } from './Editor';
import { AppContext } from '../utils/appContext';

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
  const appConfig = useContext(AppContext);
  const imageUrl = getImageFromAttachment(task);
  const [descriptionInput, setDescriptionInput] = useState(description || '');
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);

  return (
    <Card
      css={css`
        width: 500px;
      `}
    >
      {imageUrl && (
        <CardMedia
          component="img"
          alt={`title - image`}
          height="300"
          width="500"
          image={imageUrl || placeholderImage}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <EditorInput
          value={descriptionInput}
          onChange={(data) => {
            setDescriptionInput(data);
          }}
        />
      </CardContent>
      <CardActions
        css={css`
          padding: 16px;
        `}
      >
        {appConfig.controls.allowingUpdatingDetails && (
          <Button
            size="small"
            onClick={() => onEditDescription(descriptionInput)}
            variant="contained"
          >
            Save
          </Button>
        )}
        {learnMoreLink && (
          <Button
            size="small"
            href={learnMoreLink}
            target="_blank"
            css={css`
              margin-left: auto;
            `}
          >
            View
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
