import { Grid } from 'antd';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Width-based (not user-agent based) so tablets and narrow desktop windows
 * also get the compact layout. True when the viewport is below `breakpoint`.
 */
export const useIsMobile = (breakpoint: Breakpoint = 'lg') => {
  const screens = Grid.useBreakpoint();
  // useBreakpoint is empty on the very first render; treat that as desktop
  return screens[breakpoint] === false;
};
