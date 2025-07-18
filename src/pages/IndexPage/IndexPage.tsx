// src/pages/IndexPage/IndexPage.tsx (simplified)
import { RunningRabbitLoading } from '@/components/RunningRabbitLoading';
import { LeafletMap } from '@/components/LeafletMap';
import { useMarkers } from '@/hooks/useMarkers';
import { ErrorMessage } from '@/components/ErrorMessage';
import { UrbanLayout } from '@/components/UrbanLayout';
import { useMemo } from 'react';

export function IndexPage() {
  const start_pos = useMemo(() => [52.226424, 20.998807] as [number, number], []);
  
  const { markers, isLoading, error, reload } = useMarkers(start_pos);

  return (
    <UrbanLayout allowScroll={false}>
      {isLoading && <RunningRabbitLoading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}
      <LeafletMap 
        center={[52.226424, 20.998807]}
        zoom={13}
        markers={markers}
      />
    </UrbanLayout>
  );
}