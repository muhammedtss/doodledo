import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { globalStyles, DOODLE_COLORS } from '../theme/styles';
import { AIService } from '../services/AIService';

interface AIAssistantProps {
  onAccept: (title: string, category: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onAccept }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{title: string, category: string} | null>(null);

  const handleAskAI = async () => {
    setLoading(true);
    // Hafif bir gecikme hissi verelim
    const result = await AIService.suggestTask();
    setSuggestion(result);
    setLoading(false);
  };

  const handleAdd = () => {
      if (suggestion) {
          onAccept(suggestion.title, suggestion.category);
          setSuggestion(null); // Ekledikten sonra kutuyu temizle
      }
  };

  return (
    <View style={styles.container}>
      <View style={[globalStyles.doodleBox, styles.box]}>
        
        {/* Başlık */}
        <View style={{flexDirection:'row', alignItems:'center', marginBottom: 8}}>
            <Text style={{fontSize: 24, marginRight: 5}}>✨</Text>
            <Text style={[globalStyles.textHand, {fontSize: 18, color: DOODLE_COLORS.bluePen}]}>
                AI Fikir Kutusu
            </Text>
        </View>

        {/* İçerik Alanı */}
        <View style={{minHeight: 50, justifyContent:'center'}}>
            {loading ? (
                <View style={{padding: 10}}>
                    <ActivityIndicator color={DOODLE_COLORS.ink} />
                    <Text style={[globalStyles.textHand, {textAlign:'center', fontSize:12}]}>Düşünüyor...</Text>
                </View>
            ) : suggestion ? (
                <View>
                    <Text style={[globalStyles.textHand, {fontSize: 20, marginBottom: 10}]}>
                        {suggestion.title}
                    </Text>
                    
                    {/* BUTON GRUBU */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        
                        {/* 1. KABUL ET BUTONU */}
                        <TouchableOpacity 
                            onPress={handleAdd}
                            style={styles.addButton}
                        >
                            <Text style={[globalStyles.textHand, {color:'#fff', fontSize:16}]}>+ Listeye Ekle</Text>
                        </TouchableOpacity>

                        {/* 2. BAŞKA VER BUTONU (YENİ) */}
                        <TouchableOpacity 
                            onPress={handleAskAI}
                            style={styles.retryButton}
                        >
                            <Text style={[globalStyles.textHand, {color: DOODLE_COLORS.ink, fontSize:14}]}>Başka? 🎲</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View>
                    <Text style={[globalStyles.textHand, {color: DOODLE_COLORS.pencil, fontSize: 16, marginBottom: 10}]}>
                        "Bugün ne yapsam?" diye düşünme. Bana sor!
                    </Text>
                    <TouchableOpacity onPress={handleAskAI} style={styles.askButton}>
                        <Text style={[globalStyles.textHand, {fontSize: 16}]}>Bana Görev Ver! 🪄</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 100, // FAB butonunun altında kalmasın
  },
  box: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: DOODLE_COLORS.bluePen,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 15
  },
  askButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 20,
    borderColor: DOODLE_COLORS.ink,
    backgroundColor: '#e8f8f5',
    elevation: 2
  },
  addButton: {
    backgroundColor: DOODLE_COLORS.bluePen,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: DOODLE_COLORS.ink
  },
  retryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    // Sadece yazı gibi görünsün ya da hafif buton
    borderBottomWidth: 1,
    borderBottomColor: DOODLE_COLORS.ink
  }
});