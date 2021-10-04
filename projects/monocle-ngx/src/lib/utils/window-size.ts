import { PixelArea } from '../models/pixel-area.type';

export const windowSize = (): PixelArea =>
  window.innerWidth + 'x' + window.innerHeight;
