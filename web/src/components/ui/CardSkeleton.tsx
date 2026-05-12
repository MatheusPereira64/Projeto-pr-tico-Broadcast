import { Box, Card, CardContent, Skeleton } from '@mui/material';

interface CardSkeletonProps {
  count?: number;
  variant?: 'connection' | 'contact' | 'message';
}

const ConnectionSkeleton = () => (
  <Card elevation={0}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 3 }} />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </Box>
      <Skeleton variant="text" width="60%" height={28} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="40%" height={20} />
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: 5 }} />
        <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: 5 }} />
      </Box>
    </CardContent>
  </Card>
);

const ContactSkeleton = () => (
  <Card elevation={0}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="55%" height={24} />
          <Skeleton variant="text" width="40%" height={18} />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const MessageSkeleton = () => (
  <Card elevation={0}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 5 }} />
            <Skeleton variant="text" width={120} height={24} />
          </Box>
          <Skeleton variant="text" width="90%" height={20} />
          <Skeleton variant="text" width="75%" height={20} />
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            <Skeleton variant="rounded" width={90} height={26} sx={{ borderRadius: 5 }} />
            <Skeleton variant="rounded" width={90} height={26} sx={{ borderRadius: 5 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const CardSkeleton = ({ count = 3, variant = 'connection' }: CardSkeletonProps) => {
  const SkeletonComponent = variant === 'contact' ? ContactSkeleton : variant === 'message' ? MessageSkeleton : ConnectionSkeleton;
  const isGrid = variant === 'connection';

  return (
    <Box sx={isGrid ? { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2.5 } : { display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </Box>
  );
};
