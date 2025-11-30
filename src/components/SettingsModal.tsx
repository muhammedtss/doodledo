import React from 'react';
import { View, Text, Modal, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { getGlobalStyles, DOODLE_COLORS } from '../theme/styles';
import { useStore } from '../store/useStore';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  // debugAddInk fonksiyonunu artık çağırmıyoruz
  const { settings, exportData, importData, toggleDarkMode } = useStore();
  const styles = getGlobalStyles(settings.isDarkMode);

  const handleExport = async () => {
    const uri = await exportData();
    Alert.alert("Başarılı", `Yedek dosyan hazır:\n${uri}`);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={modalStyles.container}>
        <View style={[modalStyles.content, { backgroundColor: settings.isDarkMode ? '#2c3e50' : '#fff' }]}>
          <Text style={[styles.headerTitle, { marginBottom: 20 }]}>Ayarlar ⚙️</Text>
          
          {/* Gece Modu */}
          <View style={modalStyles.row}>
            <Text style={styles.textHand}>Gece Modu 🌙</Text>
            <Switch 
              value={settings.isDarkMode} 
              onValueChange={(val) => toggleDarkMode(val)}
              trackColor={{ false: "#767577", true: DOODLE_COLORS.bluePen }}
              thumbColor={DOODLE_COLORS.ink}
            />
          </View>

          {/* --- HİLE BUTONU BURADAN SİLİNDİ --- */}

          {/* Dışa Aktar */}
          <TouchableOpacity onPress={handleExport} style={[styles.doodleBox, { marginTop: 10 }]}>
            <Text style={[styles.textHand, { textAlign: 'center' }]}>💾 Yedeği İndir (Export)</Text>
          </TouchableOpacity>

          {/* İçe Aktar */}
          <TouchableOpacity onPress={importData} style={[styles.doodleBox, { marginTop: 10, backgroundColor: settings.isDarkMode ? '#34495e' : '#f0f3f4' }]}>
            <Text style={[styles.textHand, { textAlign: 'center' }]}>📂 Yedeği Yükle (Import)</Text>
          </TouchableOpacity>

          {/* Kapat */}
          <TouchableOpacity onPress={onClose} style={{ marginTop: 'auto', alignSelf: 'center' }}>
            <Text style={[styles.textHand, { color: DOODLE_COLORS.bluePen }]}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: { flex: 0.60, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 30, borderTopWidth: 2, borderColor: '#000' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', borderStyle: 'dashed' }
});