import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types';
import { DOODLE_COLORS, getRandomRotation } from '../theme/styles';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onLongPress: () => void;
  onToggle: () => void;
  index: number;
  isDarkMode: boolean;
  penColor?: string;
  sticker?: string;
}

const TaskItemComponent: React.FC<TaskItemProps> = ({ task, onPress, onLongPress, onToggle, index, isDarkMode, penColor, sticker }) => {
  const randomStyles = useMemo(() => {
    const rotation = getRandomRotation();
    const randomWidth = `${85 + Math.floor(Math.random() * 10)}%`;
    const stickerTop = Math.floor(Math.random() * 20) - 10;
    const stickerRight = Math.floor(Math.random() * 20) + 10;
    const stickerRotate = getRandomRotation();
    return { rotation, width: randomWidth, stickerTop, stickerRight, stickerRotate };
  }, []);

  let titleColor = isDarkMode ? DOODLE_COLORS.inkDark : DOODLE_COLORS.ink;
  if (penColor === 'red') titleColor = '#c0392b';
  if (penColor === 'gold') titleColor = '#f1c40f';

  const cardBg = isDarkMode ? '#34495e' : '#fff';
  const borderColor = isDarkMode ? '#ecf0f1' : '#2c3e50';

  return (
    <View style={{ width: '100%', alignItems: 'center', marginVertical: 6 }}>
      <TouchableOpacity 
        onPress={onPress} onLongPress={onLongPress} activeOpacity={0.8}
        style={[
          styles.card, 
          { 
            width: randomStyles.width as any,
            transform: [{ rotate: randomStyles.rotation }],
            backgroundColor: task.completed ? (isDarkMode ? '#2c3e50' : '#ecf0f1') : cardBg,
            borderColor: borderColor,
            opacity: task.completed ? 0.6 : 1,
            zIndex: 100 - index
          }
        ]}
      >
        <View style={styles.pin} />
        
        {sticker === 'cat' && (
            <Text style={{position:'absolute', top: randomStyles.stickerTop, right: randomStyles.stickerRight, fontSize: 30, transform: [{rotate: randomStyles.stickerRotate}], opacity: 0.8}}>🐾</Text>
        )}
        {sticker === 'fire' && (
            <Text style={{position:'absolute', top: randomStyles.stickerTop, right: randomStyles.stickerRight, fontSize: 30, transform: [{rotate: randomStyles.stickerRotate}], opacity: 0.8}}>🔥</Text>
        )}

        <TouchableOpacity onPress={onToggle} style={[styles.checkbox, {borderColor: borderColor}]}>
            {task.completed && <Text style={{color: borderColor, fontSize:16}}>✓</Text>}
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={[styles.text, { 
              textDecorationLine: task.completed ? 'line-through' : 'none',
              color: titleColor
          }]}>
            {task.title}
          </Text>
          
          {task.dueAt && (
            <Text style={{fontSize:12, color: borderColor, opacity:0.7, marginTop:5}}>
                ⏰ {format(new Date(task.dueAt), 'HH:mm')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 15,
    borderWidth: 2, borderRadius: 8,
    shadowColor: '#000', shadowOffset: {width:3, height:3}, shadowOpacity:0.2, elevation:3,
    overflow: 'visible'
  },
  pin: {
    position: 'absolute', top: -8, left: '50%', width: 10, height: 10,
    borderRadius: 5, backgroundColor: DOODLE_COLORS.redPen, borderWidth:1, borderColor:'#000', zIndex:10
  },
  checkbox: {
    width: 24, height: 24, borderWidth: 2, borderRadius: 12, marginRight: 15, alignItems:'center', justifyContent:'center'
  },
  text: {
    fontFamily: 'PatrickHand_400Regular', fontSize: 20
  }
});

// PERFORMANCE OPTIMIZATION: Sadece veriler değiştiğinde render et
export const TaskItem = React.memo(TaskItemComponent, (prev, next) => {
    return (
        prev.task.title === next.task.title &&
        prev.task.completed === next.task.completed &&
        prev.task.dueAt === next.task.dueAt &&
        prev.isDarkMode === next.isDarkMode &&
        prev.penColor === next.penColor &&
        prev.sticker === next.sticker
    );
});