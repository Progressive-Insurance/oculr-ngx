import { PixelArea }  from '../models/pixel-area.type';

export const screenResolution = (): PixelArea =>
  window.screen.width + 'x' + window.screen.height;
