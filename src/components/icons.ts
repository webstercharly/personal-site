import CircleCheck from '../icons/circle-check.svg';
import CircleX from '../icons/circle-x.svg';
import Info from '../icons/info.svg';
import Lightbulb from '../icons/lightbulb.svg';
import MoveRight from '../icons/move-right.svg';
import OctagonAlert from '../icons/octagon-alert.svg';
import TrendingDown from '../icons/trending-down.svg';
import TrendingUp from '../icons/trending-up.svg';
import TriangleAlert from '../icons/triangle-alert.svg';
import ZoomIn from '../icons/zoom-in.svg';

/**
 * Icons addressable by name, for the places where the name is only known at
 * runtime (the `icon` prop on Timeline and Metric). Components that know which
 * icon they want should import the .svg directly instead.
 */
export const icons = {
  'circle-check': CircleCheck,
  'circle-x': CircleX,
  info: Info,
  lightbulb: Lightbulb,
  'move-right': MoveRight,
  'octagon-alert': OctagonAlert,
  'trending-down': TrendingDown,
  'trending-up': TrendingUp,
  'triangle-alert': TriangleAlert,
  'zoom-in': ZoomIn,
};

export type IconName = keyof typeof icons;

/** Narrows an author-supplied string (which may be an emoji) to a known icon. */
export function isIconName(value: string): value is IconName {
  return Object.hasOwn(icons, value);
}
