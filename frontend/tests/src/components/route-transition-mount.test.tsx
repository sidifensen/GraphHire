import { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import RouteTransition from '@/components/layout/RouteTransition';

const mountSpy = vi.fn();

function Probe() {
  useEffect(() => {
    mountSpy();
  }, []);

  return <div>probe</div>;
}

describe('RouteTransition mount behavior', () => {
  beforeEach(() => {
    mountSpy.mockClear();
  });

  it('mounts children once on first render', async () => {
    render(
      <RouteTransition>
        <Probe />
      </RouteTransition>,
    );

    await waitFor(() => {
      expect(mountSpy).toHaveBeenCalledTimes(1);
    });
  });
});
