import { SvgIcon, SvgIconProps } from '@mui/material';
import React from 'react';
import convert from 'color-convert';

const convertNamedColorToHex = (colorName: string): string | null => {
  // `color-convert` has a named property for named colors to RGB
  const rgb = convert.keyword.rgb(colorName);
  if (rgb) {
    // Then convert RGB to hex
    return `#${convert.rgb.hex(rgb).toLowerCase()}`;
  }
  return null; // Or a default hex value
};

const getFilamentColorLookup = (color: string): string => {
  const lowerColor = color.toLowerCase();

  const colorMap: Record<string, string> = {
    'blue': '#1a77c9',
    'red': '#d32f2f',
    'green': '#2e7d32',
    'yellow': '#ffc107',
    'orange': '#ff9800',
    'black': '#263238',
    'white': '#f5f5f5',
    'purple': '#9c27b0',
    'pink': '#e91e63',
    'brown': '#795548',
    'grey': '#9e9e9e',
    'gray': '#9e9e9e',
    'cyan': '#00bcd4',
    'teal': '#009688',
    'lime': '#cddc39',
    'transparent': 'rgba(176, 182, 195, 0.7)',
    'clear': 'rgba(255,255,255,0.7)',
  };

  for (const key of Object.keys(colorMap)) {
    if (lowerColor.includes(key)) {
      return colorMap[key];
    }
  }

  // Default color if no match
  return "#000000";
};

//convert color using library, else try to convert it using the fall back table
const convertColorUni = (colorString: string): string => {
  const convertedColor = convertNamedColorToHex(colorString);
  if (!convertedColor) {
    const convertedColorTable = getFilamentColorLookup(colorString);
    return convertedColorTable;
  } else {

    return convertedColor;
  }

};

const AngledSpoolIcon: React.FC<{ fillColor: string } & SvgIconProps> = ({ fillColor, ...props }) => (
  <SvgIcon
    viewBox="0 0 140 100"
    {...props}
  >
    <defs>
      <linearGradient id="shineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="white" stopOpacity="0" />
        <stop offset="30%" stopColor="white" stopOpacity="0.5" />
        <stop offset="75%" stopColor="white" stopOpacity="0" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* Back (right) rim with thickness*/}
    <ellipse
      cx="82"
      cy="50"
      rx="26"
      ry="42"
      fill="#505050"
    />
    <ellipse
      cx="80"
      cy="50"
      rx="26"
      ry="41"
      fill="#606060"
    />
    {/* Filament band (main color) */}
    <ellipse
      cx="75"
      cy="50"
      rx="25"
      ry="37"
      fill={convertColorUni(fillColor)}
    />
    <ellipse
      cx="75"
      cy="50"
      rx="25"
      ry="37"
      fill="url(#shineGradient)"
      opacity={0.1}
    />
    {/* Filament band highlight*/}
    <ellipse
      cx="70"
      cy="45"
      rx="15"
      ry="30"
      fill="#000"
      opacity={0.05}
    />
    {/* Front (left) rim with thickness */}
    <ellipse
      cx="57"
      cy="50"
      rx="26"
      ry="42"
      fill="#666"
    />
    <ellipse
      cx="55"
      cy="50"
      rx="26"
      ry="41"
      fill="#777"
    />
    {/* Center hole with depth */}
    <ellipse
      cx="55"
      cy="50"
      rx="7"
      ry="11"
      fill="#282828"
    />
    <ellipse
      cx="58"
      cy="50"
      rx="4"
      ry="9"
      fill="#000"
    />
  </SvgIcon>
);
export default AngledSpoolIcon;