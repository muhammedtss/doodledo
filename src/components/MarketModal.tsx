import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { globalStyles, DOODLE_COLORS } from '../theme/styles';
import { useStore } from '../store/useStore';

interface MarketModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MarketModal: React.FC<MarketModalProps> = ({ visible, onClose }) => {
  const { shopItems, stats, buyItem, equipItem, unequipItem, settings } = useStore();

  const isEquipped = (item: any) => {
      if (item.type === 'pen') return settings.activePen === item.value;
      if (item.type === 'bg') return settings.activeBg === item.value;
      if (item.type === 'sticker') return settings.activeSticker === item.value;
      return false;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
            <Text style={globalStyles.headerTitle}>Kırtasiye 🏪</Text>
            <View style={{backgroundColor: DOODLE_COLORS.paper, padding:8, borderRadius:10, borderWidth:1, borderColor: DOODLE_COLORS.ink}}>
                <Text style={globalStyles.textHand}>💧 {stats.ink} Mürekkep</Text>
            </View>
          </View>

          <FlatList
            data={shopItems}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const active = isEquipped(item);
              return (
              <View style={[globalStyles.doodleBox, { flexDirection: 'row', alignItems: 'center', backgroundColor: active ? '#e8f8f5' : '#fff' }]}>
                <Text style={{fontSize: 40, marginRight: 15}}>{item.icon}</Text>
                <View style={{flex: 1}}>
                    <Text style={[globalStyles.textHand, {fontSize: 20}]}>{item.name}</Text>
                    <Text style={[globalStyles.textHand, {fontSize: 14, color: DOODLE_COLORS.pencil}]}>{item.description}</Text>
                </View>
                <View style={{alignItems:'center'}}>
                    {item.owned ? (
                        active ? (
                            <TouchableOpacity onPress={() => unequipItem(item.type)} style={{padding:5, borderWidth:1, borderRadius:5, borderColor: DOODLE_COLORS.ink}}>
                                <Text style={{fontSize:12}}>Çıkar ❌</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => equipItem(item)} style={{padding:5, borderWidth:1, borderRadius:5, backgroundColor: DOODLE_COLORS.ink}}>
                                <Text style={{fontSize:12, color:'#fff'}}>Kullan ✅</Text>
                            </TouchableOpacity>
                        )
                    ) : (
                        <TouchableOpacity onPress={() => buyItem(item.id)} style={{backgroundColor: DOODLE_COLORS.bluePen, padding:5, borderRadius:5}}>
                            <Text style={[globalStyles.textHand, {color:'#fff', fontSize:14}]}>{item.price}💧</Text>
                        </TouchableOpacity>
                    )}
                </View>
              </View>
            )}}
          />

          <TouchableOpacity onPress={onClose} style={{ marginTop: 20, alignSelf: 'center' }}>
            <Text style={[globalStyles.textHand, { color: DOODLE_COLORS.redPen }]}>Dükkandan Çık</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: { flex: 0.85, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, backgroundColor: '#fff', borderTopWidth: 3, borderColor: DOODLE_COLORS.ink }
});