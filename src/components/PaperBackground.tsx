import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Defs, Pattern, Rect, Circle } from 'react-native-svg';
import { DOODLE_COLORS } from '../theme/styles';

interface PaperProps {
  isDarkMode: boolean;
  pattern?: string;
}

const PaperBackgroundComponent: React.FC<PaperProps> = ({ isDarkMode, pattern = 'grid' }) => {
  const GRID_COLOR = isDarkMode ? '#ecf0f1' : '#bdc3c7'; 
  const BG_COLOR = isDarkMode ? DOODLE_COLORS.paperDark : DOODLE_COLORS.paper;
  const OPACITY = isDarkMode ? 0.2 : 0.45;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: -999 }]} pointerEvents="none">
      <Svg height="100%" width="100%">
        <Defs>
          <Pattern id="pattern" width="30" height="30" patternUnits="userSpaceOnUse">
            {pattern === 'grid' && (
                <>
                    <Line x1="0" y1="0" x2="0" y2="30" stroke={GRID_COLOR} strokeWidth="1" opacity={OPACITY} />
                    <Line x1="0" y1="0" x2="30" y2="0" stroke={GRID_COLOR} strokeWidth="1" opacity={OPACITY} />
                </>
            )}
            {pattern === 'lines' && (
                <Line x1="0" y1="30" x2="30" y2="30" stroke={GRID_COLOR} strokeWidth="1" opacity={OPACITY} />
            )}
            {pattern === 'dots' && (
                <Circle cx="15" cy="15" r="1.5" fill={GRID_COLOR} opacity={OPACITY} />
            )}
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={BG_COLOR} />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#pattern)" />
      </Svg>
    </View>
  );
};

export const PaperBackground = React.memo(PaperBackgroundComponent);