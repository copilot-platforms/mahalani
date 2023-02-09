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
        {showDescriptionInput ? (
          <TextareaAutosize
            style={{ width: '100%', fontFamily: 'inherit', padding: '0.5rem' }}
            placeholder="Description (optional)"
            autoFocus
            minRows={3}
            value={descriptionInput}
            onChange={(e) => {
              const value = e.target.value;
              setDescriptionInput(value);
              onEditDescription(value);
            }}
            onBlur={() => setShowDescriptionInput(false)}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              onClick={() => setShowDescriptionInput(true)}
            >
              {description || 'No description'}
            </Typography>

            <IconButton onClick={() => setShowDescriptionInput(true)}>
              <EditIcon
                style={{
                  fontSize: 12,
                }}
              />
            </IconButton>
          </div>
        )}
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
