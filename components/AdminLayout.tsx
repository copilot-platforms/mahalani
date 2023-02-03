import { Grid, Box, Typography } from '@mui/material';
import { Container } from '@mui/system';
import Image from 'next/image';
import CopilotLogo from '../assets/Copilot_Icon_Circle.png';

type AdminLayoutProps = {
  description: string;
  showTitle?: boolean;
  children: React.ReactNode;
};

export const AdminLayout = ({
  description,
  showTitle = true,
  children,
}: AdminLayoutProps) => {
  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" pt={8}>
        <Image
          src={CopilotLogo}
          alt="Copilot logo"
          width="100"
          // use the priority property on any image detected as the Largest Contentful Paint (LCP) element
          priority
        />
        {showTitle && (
          <Box mt={4}>
            <Typography variant="h2" textAlign="center">
              Client Task Management
            </Typography>
          </Box>
        )}
        <Box mt={2}>
          <Typography variant="h6" textAlign="center">
            {description}
          </Typography>
        </Box>
        <Box
          mt={8}
          width={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          {children}
        </Box>
      </Box>
    </Container>
  );
};
