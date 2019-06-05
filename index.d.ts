export type Color = [number, number, number];

export type ExtractHexOptions = `hex` | {
  outputType: `hex`;
  ignoredColors: Array<string>;
};

export type ExtractCssOptions = `css` | {
  outputType: `css`;
  ignoredColors: Array<string>;
};

export function dominantColor(colorList: Array<Color>, treshold?: number, count?: number | null);

export function extractImageColors(image: any, options?: ExtractHexOptions);
export function extractImageColors(image: any, options: ExtractCssOptions);
