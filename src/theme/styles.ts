import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

export const DOODLE_COLORS = {
  ink: '#000000',         
  paper: '#f4eecf',       
  paperDark: '#2c3e50',   
  inkDark: '#ecf0f1',     
  
  pencil: '#7f8c8d',
  redPen: '#c0392b',      
  bluePen: '#2980b9',
  
  noteYellow: '#fff9c4',
  notePink: '#f8bbd0',
  noteGreen: '#c8e6c9',
  noteBlue: '#bbdefb',
};

export const getRandomRotation = () => {
  const deg = Math.floor(Math.random() * 5) - 2; 
  return `${deg}deg`;
};

// DİNAMİK STİL OLUŞTURUCU
export const getGlobalStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 30) + 10 : 0,
    backgroundColor: isDarkMode ? DOODLE_COLORS.paperDark : 'transparent',
  },
  headerTitle: {
    fontFamily: 'PatrickHand_400Regular',
    fontSize: 36,
    color: isDarkMode ? DOODLE_COLORS.inkDark : DOODLE_COLORS.ink,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  textHand: {
    fontFamily: 'PatrickHand_400Regular',
    color: isDarkMode ? DOODLE_COLORS.inkDark : DOODLE_COLORS.ink,
    fontSize: 20,
  },
  sketchCard: {
    backgroundColor: isDarkMode ? '#34495e' : '#fff',
    borderWidth: 2,
    borderColor: isDarkMode ? DOODLE_COLORS.inkDark : DOODLE_COLORS.ink,
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  doodleBox: {
    borderWidth: 2,
    borderColor: isDarkMode ? DOODLE_COLORS.inkDark : DOODLE_COLORS.ink,
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    backgroundColor: isDarkMode ? '#34495e' : '#fff',
    borderStyle: 'dashed',
  },
  
  // --- İŞTE EKSİK OLAN FAB STİLİ ---
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 40,
    backgroundColor: DOODLE_COLORS.bluePen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    // Kenarlık rengi de moda göre değişsin
    borderColor: isDarkMode ? DOODLE_COLORS.inkDark : DOODLE_COLORS.ink,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    transform: [{ rotate: '-5deg' }],
    zIndex: 9999 // En üstte kalması garanti olsun
  }
});

// Varsayılan export (Geriye uyumluluk için)
export const globalStyles = getGlobalStyles(false);