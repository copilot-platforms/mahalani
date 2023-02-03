import { Button, Card, CardMedia, CardContent, Typography, CardActions, Chip } from '@mui/material';
import {
  SignalCellularAlt1Bar,
  SignalCellularAlt2Bar,
} from '@mui/icons-material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import { Task } from './types';

type DetailedCardViewProps = {
  task: Task
};

const getImageFromAttachment = (task: Task) => {
  if (!task.attachments) {
    return null;
  }

  const imageAttachment = task.attachments.find(a => a.type.startsWith('image'))
  if (!imageAttachment) {
    return null;
  }

  return imageAttachment.url;
}

export const DetailedCardView = ({ task }: DetailedCardViewProps) => {
  const { title, description, learnMoreLink } = task;
  const imageUrl = getImageFromAttachment(task);
  
  return (
    <Card>
      {imageUrl && (
        <CardMedia
          component="img"
          alt={`title - image`}
          height="140"
          image={imageUrl}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Details: {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap'}}>
          {description}
        </Typography>
      </CardContent>
      {learnMoreLink && (
        <CardActions>
          <Button target="_blank" size="small" href={learnMoreLink}>Learn More</Button>
        </CardActions>
      )}
      
    </Card>
  )
}