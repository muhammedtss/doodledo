import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Defs, Pattern, Rect, Circle } from 'react-native-svg'; // Circle eklendi
import { DOODLE_COLORS } from '../theme/styles';

interface PaperProps {
  isDarkMode: boolean;
  pattern?: string; // 'grid', 'lines', 'dots'
}

export const PaperBackground: React.FC<PaperProps> = ({ isDarkMode, pattern = 'grid' }) => {
  // Renk ayarları
  const GRID_COLOR = isDarkMode ? '#ecf0f1' : '#bdc3c7'; 
  const BG_COLOR = isDarkMode ? DOODLE_COLORS.paperDark : DOODLE_COLORS.paper;
  
  // Noktalar biraz daha belirgin olsun diye opaklığı artırdık
  const OPACITY = isDarkMode ? 0.2 : 0.45;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: -999 }]} pointerEvents="none">
      <Svg height="100%" width="100%">
        <Defs>
          {/* Desen Birimi: 30x30 birimlik kareler */}
          <Pattern id="pattern" width="30" height="30" patternUnits="userSpaceOnUse">
            
            {/* 1. KARELİ (GRID) MODU */}
            {pattern === 'grid' && (
                <>
                    <Line x1="0" y1="0" x2="0" y2="30" stroke={GRID_COLOR} strokeWidth="1" opacity={OPACITY} />
                    <Line x1="0" y1="0" x2="30" y2="0" stroke={GRID_COLOR} strokeWidth="1" opacity={OPACITY} />
                </>
            )}

            {/* 2. ÇİZGİLİ (LINES) MODU */}
            {pattern === 'lines' && (
                <Line x1="0" y1="30" x2="30" y2="30" stroke={GRID_COLOR} strokeWidth="1" opacity={OPACITY} />
            )}

            {/* 3. NOKTALI (DOTS) MODU - YENİ! */}
            {pattern === 'dots' && (
                <Circle cx="15" cy="15" r="1.5" fill={GRID_COLOR} opacity={OPACITY} />
            )}

          </Pattern>
        </Defs>
        
        {/* Arka Plan Rengi */}
        <Rect x="0" y="0" width="100%" height="100%" fill={BG_COLOR} />
        
        {/* Desenin Uygulanması */}
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#pattern)" />
      </Svg>
    </View>
  );
};