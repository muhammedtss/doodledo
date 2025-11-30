import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { globalStyles, DOODLE_COLORS } from '../theme/styles';
import { NotificationService } from '../services/NotificationService';

interface TimerModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRESETS = [15, 25, 45, 60];

export const TimerModal: React.FC<TimerModalProps> = ({ visible, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [initialDuration, setInitialDuration] = useState(25);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const handleStart = async () => {
    setIsActive(true);
    const triggerAt = Date.now() + (timeLeft * 1000);
    // Servis güncellendiği için parametreler tam uymalı
    await NotificationService.scheduleReminder(
      "Süre Doldu! ⏰", 
      "Odaklanma süresi bitti, mola ver.", 
      triggerAt
    );
  };

  const handlePause = async () => {
    setIsActive(false);
    await NotificationService.cancelAll();
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(initialDuration * 60);
    NotificationService.cancelAll();
  };

  const selectDuration = (min: number) => {
    setInitialDuration(min);
    setTimeLeft(min * 60);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[globalStyles.container, styles.modalContent]}>
          <Text style={[globalStyles.headerTitle, { textAlign: 'center', marginBottom: 20 }]}>
            Zamanlayıcı ⏳
          </Text>

          <View style={[globalStyles.doodleBox, styles.timerDisplay]}>
            <Text style={{ fontFamily: 'PatrickHand_400Regular', fontSize: 60, color: DOODLE_COLORS.ink }}>
              {formatTime(timeLeft)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 }}>
            {PRESETS.map((min) => (
              <TouchableOpacity 
                key={min} 
                onPress={() => selectDuration(min)}
                style={[
                  styles.presetBtn, 
                  initialDuration === min && { backgroundColor: DOODLE_COLORS.paper }
                ]}
              >
                <Text style={globalStyles.textHand}>{min}dk</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
            {!isActive ? (
              <TouchableOpacity onPress={handleStart} style={styles.actionBtn}>
                <Text style={[globalStyles.textHand, { color: '#fff' }]}>Başlat ▶️</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handlePause} style={[styles.actionBtn, { backgroundColor: DOODLE_COLORS.pencil }]}>
                <Text style={[globalStyles.textHand, { color: '#fff' }]}>Duraklat ⏸️</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleReset} style={[styles.actionBtn, { backgroundColor: DOODLE_COLORS.redPen }]}>
              <Text style={[globalStyles.textHand, { color: '#fff' }]}>Sıfırla ⏹️</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={{ marginTop: 30, alignSelf: 'center' }}>
            <Text style={globalStyles.textHand}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: DOODLE_COLORS.ink
  },
  timerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderColor: DOODLE_COLORS.bluePen,
    borderWidth: 3
  },
  presetBtn: {
    padding: 10,
    borderWidth: 2,
    borderColor: DOODLE_COLORS.ink,
    borderRadius: 10,
    minWidth: 50,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  actionBtn: {
    backgroundColor: DOODLE_COLORS.bluePen,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: DOODLE_COLORS.ink
  }
});