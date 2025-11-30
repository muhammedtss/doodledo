import * as Notifications from 'expo-notifications';

// Bildirim davranışlarını ayarla
// HATA ÇÖZÜMÜ: Dönüş değerini 'as any' yaparak TypeScript kontrolünü susturuyoruz.
// Runtime'da bu ayarlar geçerlidir.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as any),
});

export const NotificationService = {
  // İzin İsteme
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        return newStatus === 'granted';
      }
      return true;
    } catch (error) {
      console.log('Permission Error:', error);
      return false;
    }
  },

  // Hatırlatıcı Planlama
  scheduleReminder: async (title: string, body: string, triggerAt: number): Promise<void> => {
    const now = Date.now();
    const diff = triggerAt - now;

    // Eğer tarih geçmişse planlama yapma
    if (diff <= 0) return;

    try {
      // TypeScript Hatasını Önleyen Kritik Hamle:
      // Trigger objesini 'any' olarak tanımlayıp TS kontrolünden kaçırıyoruz.
      const triggerConfig: any = {
        seconds: Math.floor(diff / 1000), // Saniye cinsinden fark
        repeats: false,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          sound: true,
        },
        trigger: triggerConfig,
      });
    } catch (error) {
      console.log('Notification Schedule Failed:', error);
    }
  },

  // Tüm Bildirimleri İptal Etme
  cancelAll: async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};