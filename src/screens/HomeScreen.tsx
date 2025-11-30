import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TextInput, FlatList, SafeAreaView, TouchableOpacity, Platform, KeyboardAvoidingView, Alert, Vibration } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { format, addDays, isSameDay } from 'date-fns';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import ConfettiCannon from 'react-native-confetti-cannon'; // YENİ EKLENTİ

import { useStore } from '../store/useStore';
import { getGlobalStyles, DOODLE_COLORS } from '../theme/styles';
import { TaskItem } from '../components/TaskItem';
import { TimerModal } from '../components/TimerModal';
import { SettingsModal } from '../components/SettingsModal';
import { MarketModal } from '../components/MarketModal';
import { PaperBackground } from '../components/PaperBackground';
import { AIAssistant } from '../components/AIAssistant';
import { NotificationService } from '../services/NotificationService';
import { Task, TaskCategory } from '../types';
import { generateUUID } from '../utils/idGenerator';
import { useTaskFilters } from '../hooks/useTaskFilters';

const DEFAULT_CATEGORIES = ['Personal', 'Work', 'Shopping'];

export const HomeScreen = () => {
  const { tasks, stats, settings, inventory, initialize, addTask, updateTask, deleteTask, toggleComplete, isLoading } = useStore();
  const styles = getGlobalStyles(settings.isDarkMode);
  
  // Konfeti Referansı
  const confettiRef = useRef<ConfettiCannon>(null);

  // Market Envanter
  const hasRedPen = inventory.includes('pen_red');
  const hasGoldPen = inventory.includes('pen_gold');
  const activePen = hasGoldPen ? 'gold' : (hasRedPen ? 'red' : 'default');
  const activePattern = inventory.includes('bg_lines') ? 'lines' : (inventory.includes('bg_dots') ? 'dots' : 'grid');

  // UI State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setModalVisible] = useState(false);
  const [isTimerVisible, setTimerVisible] = useState(false);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isMarketVisible, setMarketVisible] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | string>('Personal');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [tempDate, setTempDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  let visibleTasks = useTaskFilters(tasks, selectedDate);
  if (searchQuery.trim()) {
    visibleTasks = visibleTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  const completedCount = visibleTasks.filter(t => t.completed).length;
  const totalCount = visibleTasks.length;

  useEffect(() => {
    initialize();
    NotificationService.requestPermissions().catch(() => {});
    const existingCats = Array.from(new Set(tasks.map(t => t.category || 'Personal')));
    setCategories(prev => Array.from(new Set([...prev, ...existingCats])));
  }, [tasks]);

  if (isLoading) return null;

  // --- MANTIK ---

  const handleToggle = (id: string, completed: boolean) => {
      // Eğer görev tamamlanıyorsa (false -> true), konfeti patlat!
      if (!completed) {
          Vibration.vibrate(50);
          confettiRef.current?.start();
      } else {
          Vibration.vibrate(10);
      }
      toggleComplete(id);
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTaskId(task.id);
      setNewTaskTitle(task.title);
      setSelectedCategory(task.category || 'Personal');
      setTempDate(new Date(task.dueAt || Date.now()));
    } else {
      setEditingTaskId(null);
      setNewTaskTitle('');
      setSelectedCategory('Personal');
      const now = new Date();
      const def = new Date(selectedDate);
      def.setHours(now.getHours(), now.getMinutes());
      setTempDate(def);
    }
    setModalVisible(true);
    setIsAddingCategory(false);
  };

  const handleAIAccept = (title: string, category: string) => {
    setEditingTaskId(null);
    setNewTaskTitle(title);
    setSelectedCategory(category);
    setTempDate(new Date());
    setModalVisible(true);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
        setCategories(prev => [...prev, newCategoryName.trim()]);
        setSelectedCategory(newCategoryName.trim());
        setNewCategoryName('');
        setIsAddingCategory(false);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'dismissed' || !selected) return;
    setTempDate(prev => {
        const next = new Date(prev);
        if (pickerMode === 'date') next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
        else next.setHours(selected.getHours(), selected.getMinutes());
        return next;
    });
  };

  const handleSave = async () => {
    if (!newTaskTitle.trim()) { Alert.alert("Eksik", "Lütfen bir görev yaz."); return; }
    Vibration.vibrate(10);
    const taskData: any = { title: newTaskTitle, category: selectedCategory, dueAt: tempDate.getTime(), updatedAt: Date.now() };
    if (editingTaskId) {
      const existing = tasks.find(t => t.id === editingTaskId);
      if (existing) await updateTask({ ...existing, ...taskData });
    } else {
      await addTask({ id: generateUUID(), createdAt: Date.now(), completed: false, priority: 'medium', reminders: [], attachments: [], ...taskData });
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Vibration.vibrate(50);
    setModalVisible(false);
    setTimeout(() => { Alert.alert("Sil?", "Görevi siliyor musun?", [{ text: "Hayır", style: "cancel" }, { text: "Evet", style: "destructive", onPress: () => deleteTask(id) }]); }, 200);
  };

  const renderHeader = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: settings.isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(232, 240, 254, 0.7)', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, borderWidth: 2, borderColor: settings.isDarkMode ? DOODLE_COLORS.inkDark : 'rgba(44, 62, 80, 0.1)', borderStyle: 'dashed', marginBottom: 15 }}>
        <View>
            <Text style={styles.headerTitle}>DoodleDo</Text>
            <Text style={[styles.textHand, {fontSize:14, color: DOODLE_COLORS.bluePen}]}>Lvl {stats.level} • {stats.ink} 💧 • 🔥 {stats.streak}</Text>
        </View>
        <View style={{flexDirection:'row', gap:10}}>
            <TouchableOpacity onPress={()=>setMarketVisible(true)} style={styles.doodleBox}><Text style={{fontSize:20}}>🏪</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>setSettingsVisible(true)} style={styles.doodleBox}><Text style={{fontSize:20}}>⚙️</Text></TouchableOpacity>
        </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PaperBackground isDarkMode={settings.isDarkMode} pattern={settings.activeBg as any} />
      <StatusBar style={settings.isDarkMode ? "light" : "dark"} />
      
      {/* KONFETİ TOPU (Görünmez, sadece patlayınca efekt verir) */}
      <ConfettiCannon 
        count={200} 
        origin={{x: -10, y: 0}} 
        autoStart={false} 
        ref={confettiRef} 
        fadeOut={true}
      />

      <View style={{ flex: 1, padding: 20 }}>
        {renderHeader()}
        
        <View style={{marginBottom: 5}}>
            <TextInput style={[styles.doodleBox, styles.textHand, {height: 45, paddingVertical: 5, fontSize: 16, borderRadius: 20}]} placeholder="🔍 Ara..." placeholderTextColor={settings.isDarkMode ? '#bdc3c7' : '#95a5a6'} value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal: 5}}>
            <Text style={[styles.textHand, {fontSize: 20}]}>{format(selectedDate, 'MMMM yyyy')}</Text>
            <Text style={[styles.textHand, {fontSize:14, color: DOODLE_COLORS.bluePen}]}>{completedCount}/{totalCount} Tamam</Text>
        </View>

        <View style={{flexDirection:'row', marginBottom:10}}>
            {[0,1,2,3,4].map(i => {
                const d = addDays(new Date(), i);
                const isSel = isSameDay(d, selectedDate);
                return (
                    <TouchableOpacity key={i} onPress={()=>setSelectedDate(d)} style={[styles.doodleBox, {padding:10, marginRight:10, backgroundColor: isSel ? (settings.isDarkMode ? '#fff' : '#2c3e50') : 'transparent'}]}>
                        <Text style={[styles.textHand, {fontSize:14, color: isSel ? (settings.isDarkMode ? '#000' : '#fff') : (settings.isDarkMode ? '#fff' : '#000')}]}>{format(d, 'dd')}</Text>
                    </TouchableOpacity>
                )
            })}
        </View>

        <FlatList
          data={visibleTasks}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item, index }) => (
            <TaskItem 
                task={item as any} 
                index={index} 
                onPress={() => openModal(item as any)} 
                onLongPress={() => handleDelete(item.id)}
                onToggle={() => handleToggle(item.id, item.completed)} // Konfeti tetikleyici
                isDarkMode={settings.isDarkMode}
                penColor={settings.activePen}
                sticker={settings.activeSticker}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.5 }}>
              <Text style={{ fontSize: 60 }}>🍃</Text>
              <Text style={styles.textHand}>{searchQuery ? "Sonuç yok." : "Kağıt boş..."}</Text>
            </View>
          }
          ListFooterComponent={<AIAssistant onAccept={handleAIAccept} />}
        />

        <TouchableOpacity onPress={() => openModal()} style={styles.fab}><Text style={{fontSize:32, color:'#fff'}}>+</Text></TouchableOpacity>
      </View>

      {/* MODALLAR (Kısaltıldı - Öncekilerle Aynı) */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
         <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.5)'}}>
            <View style={[styles.container, {flex:0.85, padding:20, backgroundColor: settings.isDarkMode ? '#2c3e50' : '#fff', borderTopLeftRadius:20, borderTopRightRadius:20}]}>
                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:20}}>
                    <Text style={styles.headerTitle}>{editingTaskId ? 'Düzenle' : 'Yeni Not'}</Text>
                    <TouchableOpacity onPress={()=>setModalVisible(false)}><Text style={{fontSize:24}}>❌</Text></TouchableOpacity>
                </View>
                <TextInput style={[styles.doodleBox, styles.textHand]} placeholder="Ne yapacaksın?" placeholderTextColor={settings.isDarkMode ? '#bdc3c7' : '#95a5a6'} value={newTaskTitle} onChangeText={setNewTaskTitle} />
                
                <Text style={[styles.textHand, {marginTop: 10}]}>Kategori:</Text>
                <View style={{flexDirection:'row', flexWrap: 'wrap', gap: 8, marginTop: 5, marginBottom: 15}}>
                    {categories.map((cat) => (
                        <TouchableOpacity key={cat} onPress={()=>setSelectedCategory(cat)} style={{paddingVertical: 6, paddingHorizontal: 12, borderWidth: 2, borderRadius: 15, borderColor: settings.isDarkMode ? DOODLE_COLORS.inkDark : DOODLE_COLORS.ink, backgroundColor: selectedCategory===cat ? (settings.isDarkMode ? DOODLE_COLORS.inkDark : DOODLE_COLORS.ink) : 'transparent'}}>
                            <Text style={[styles.textHand, {color: selectedCategory===cat ? (settings.isDarkMode ? '#000' : '#fff') : (settings.isDarkMode ? '#fff' : '#000'), fontSize: 14}]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                    {!isAddingCategory ? (<TouchableOpacity onPress={() => setIsAddingCategory(true)} style={{paddingVertical: 6, paddingHorizontal: 12, borderWidth: 2, borderRadius: 15, borderColor: DOODLE_COLORS.bluePen, borderStyle: 'dashed'}}><Text style={[styles.textHand, {color: DOODLE_COLORS.bluePen, fontSize: 14}]}>+ Ekle</Text></TouchableOpacity>) : (<View style={{flexDirection:'row', alignItems:'center', gap: 5}}><TextInput style={{borderBottomWidth: 1, borderColor:'#ccc', width: 80, color: settings.isDarkMode ? '#fff' : '#000'}} placeholder="Yeni..." value={newCategoryName} onChangeText={setNewCategoryName} autoFocus /><TouchableOpacity onPress={handleAddCategory}><Text>✅</Text></TouchableOpacity><TouchableOpacity onPress={()=>setIsAddingCategory(false)}><Text>❌</Text></TouchableOpacity></View>)}
                </View>

                <View style={{flexDirection:'row', gap:10, marginVertical:10}}>
                    <TouchableOpacity onPress={()=>{setShowPicker(true); setPickerMode('date')}} style={[styles.doodleBox, {flex:1}]}><Text style={styles.textHand}>📅 {format(tempDate, 'dd MMM')}</Text></TouchableOpacity>
                    <TouchableOpacity onPress={()=>{setShowPicker(true); setPickerMode('time')}} style={[styles.doodleBox, {flex:1}]}><Text style={styles.textHand}>⏰ {format(tempDate, 'HH:mm')}</Text></TouchableOpacity>
                </View>
                {showPicker && (<DateTimePicker value={tempDate} mode={pickerMode} is24Hour={true} display="default" onChange={(e, d) => {if(Platform.OS==='android') setShowPicker(false); if(d) setTempDate(d);}} />)}
                <View style={{marginTop:'auto'}}>
                    <TouchableOpacity onPress={handleSave} style={[styles.doodleBox, {marginTop:20, backgroundColor: DOODLE_COLORS.bluePen}]}><Text style={[styles.textHand, {color:'#fff', textAlign:'center'}]}>{editingTaskId ? 'Güncelle' : 'Kaydet'}</Text></TouchableOpacity>
                    {editingTaskId && (<TouchableOpacity onPress={() => handleDelete(editingTaskId)} style={{alignItems:'center', marginTop:15}}><Text style={[styles.textHand, {color: DOODLE_COLORS.redPen}]}>Sil</Text></TouchableOpacity>)}
                </View>
            </View>
         </KeyboardAvoidingView>
      </Modal>

      <MarketModal visible={isMarketVisible} onClose={() => setMarketVisible(false)} />
      <SettingsModal visible={isSettingsVisible} onClose={() => setSettingsVisible(false)} />
      <TimerModal visible={isTimerVisible} onClose={() => setTimerVisible(false)} />
    </SafeAreaView>
  );
};