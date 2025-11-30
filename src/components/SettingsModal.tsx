import React from 'react';
import { View, Text, Modal, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { getGlobalStyles, DOODLE_COLORS } from '../theme/styles';
import { useStore } from '../store/useStore';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const { settings, exportData, importData, toggleDarkMode, debugAddInk } = useStore();
  const styles = getGlobalStyles(settings.isDarkMode);

  const handleExport = async () => {
    const uri = await exportData();
    Alert.alert("Yedeklendi", uri);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={modalStyles.container}>
        <View style={[modalStyles.content, { backgroundColor: settings.isDarkMode ? '#2c3e50' : '#fff' }]}>
          <Text style={[styles.headerTitle, { marginBottom: 20 }]}>Ayarlar ⚙️</Text>
          
          <View style={modalStyles.row}>
            <Text style={styles.textHand}>Gece Modu 🌙</Text>
            <Switch 
              value={settings.isDarkMode} 
              onValueChange={(val) => toggleDarkMode(val)}
              trackColor={{ false: "#767577", true: DOODLE_COLORS.bluePen }}
              thumbColor={DOODLE_COLORS.ink}
            />
          </View>

          <TouchableOpacity onPress={debugAddInk} style={[styles.doodleBox, { marginTop: 10, borderColor: DOODLE_COLORS.redPen }]}>
            <Text style={[styles.textHand, { textAlign: 'center', color: DOODLE_COLORS.redPen }]}>🧪 +500 Mürekkep</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleExport} style={[styles.doodleBox, { marginTop: 10 }]}>
            <Text style={[styles.textHand, { textAlign: 'center' }]}>💾 Yedeği İndir (Export)</Text>
          </TouchableOpacity>

          {/* YENİ: İÇE AKTAR BUTONU */}
          <TouchableOpacity onPress={importData} style={[styles.doodleBox, { marginTop: 10, backgroundColor:'#f0f3f4' }]}>
            <Text style={[styles.textHand, { textAlign: 'center' }]}>📂 Yedeği Yükle (Import)</Text>
          </TouchableOpacity>

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
  content: { flex: 0.65, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 30, borderTopWidth: 2, borderColor: '#000' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', borderStyle: 'dashed' }
});