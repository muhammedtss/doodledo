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
          
          {/* --- HEADER --- */}
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 15}}>
            <View>
                <Text style={[globalStyles.headerTitle, {fontSize: 32}]}>Kırtasiye 🏪</Text>
                <Text style={[globalStyles.textHand, {fontSize: 16, color: DOODLE_COLORS.bluePen}]}>
                    Cüzdan: {stats.ink} 💧
                </Text>
            </View>

            {/* YENİ KAPATMA BUTONU (Sağ Üst) */}
            <TouchableOpacity 
                onPress={onClose} 
                style={{
                    padding: 5,
                    transform: [{ rotate: '6deg' }] // Asimetrik duruş
                }}
            >
                <Text style={{fontSize: 28, color: DOODLE_COLORS.redPen}}>❌</Text>
            </TouchableOpacity>
          </View>

          {/* --- LİSTE --- */}
          <FlatList
            data={shopItems}
            keyExtractor={item => item.id}
            contentContainerStyle={{paddingBottom: 20}}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const active = isEquipped(item);
              return (
              <View style={[globalStyles.doodleBox, { flexDirection: 'row', alignItems: 'center', backgroundColor: active ? '#e8f8f5' : '#fff' }]}>
                <Text style={{fontSize: 36, marginRight: 15}}>{item.icon}</Text>
                <View style={{flex: 1}}>
                    <Text style={[globalStyles.textHand, {fontSize: 20}]}>{item.name}</Text>
                    <Text style={[globalStyles.textHand, {fontSize: 14, color: DOODLE_COLORS.pencil}]}>{item.description}</Text>
                </View>
                <View style={{alignItems:'center'}}>
                    {item.owned ? (
                        active ? (
                            <TouchableOpacity onPress={() => unequipItem(item.type)} style={{padding:6, borderWidth:2, borderRadius:8, borderColor: DOODLE_COLORS.ink, borderStyle:'dashed'}}>
                                <Text style={{fontSize:12, fontWeight:'bold'}}>Çıkar</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => equipItem(item)} style={{padding:6, borderWidth:2, borderRadius:8, backgroundColor: DOODLE_COLORS.ink, borderColor: DOODLE_COLORS.ink}}>
                                <Text style={{fontSize:12, color:'#fff', fontWeight:'bold'}}>Kullan</Text>
                            </TouchableOpacity>
                        )
                    ) : (
                        <TouchableOpacity onPress={() => buyItem(item.id)} style={{backgroundColor: DOODLE_COLORS.bluePen, padding:8, borderRadius:8, borderWidth:2, borderColor: DOODLE_COLORS.ink}}>
                            <Text style={[globalStyles.textHand, {color:'#fff', fontSize:14}]}>{item.price}💧</Text>
                        </TouchableOpacity>
                    )}
                </View>
              </View>
            )}}
          />
          
          {/* Alt kısımdaki buton kaldırıldı, liste artık daha geniş alana sahip */}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    flex: 0.85, // Ekranın %85'ini kaplasın
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    backgroundColor: '#fff', 
    borderTopWidth: 3,
    borderColor: DOODLE_COLORS.ink
  }
});