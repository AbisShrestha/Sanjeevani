import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface TrackedMedicine {
  id: string;
  name: string;
  imageUrl?: string | null;
  totalQty: number;
  dosagePerDay: number;
  startDate: string; // ISO string
  reminderDaysBefore: number; // notify X days before running out
  notificationId?: string; // expo notification identifier
}

interface MedicineTrackerContextType {
  trackedMedicines: TrackedMedicine[];
  addTrackedMedicine: (med: Omit<TrackedMedicine, 'id'>) => Promise<void>;
  removeTrackedMedicine: (id: string) => Promise<void>;
  getDaysRemaining: (med: TrackedMedicine) => number;
  getPercentLeft: (med: TrackedMedicine) => number;
  loading: boolean;
}

const STORAGE_KEY = '@medicine_tracker';

const MedicineTrackerContext = createContext<MedicineTrackerContextType>({
  trackedMedicines: [],
  addTrackedMedicine: async () => {},
  removeTrackedMedicine: async () => {},
  getDaysRemaining: () => 0,
  getPercentLeft: () => 0,
  loading: true,
});

export const useMedicineTracker = () => useContext(MedicineTrackerContext);

export const MedicineTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trackedMedicines, setTrackedMedicines] = useState<TrackedMedicine[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    loadFromStorage();
    registerForNotifications();
  }, []);

  const registerForNotifications = async () => {
    if (!Device.isDevice) {
      // Notifications only work on physical devices
      return;
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted.');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('medicine-refill', {
        name: 'Medicine Refill Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }
  };

  const loadFromStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setTrackedMedicines(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Failed to load tracked medicines:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = async (medicines: TrackedMedicine[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
    } catch (e) {
      console.error('Failed to save tracked medicines:', e);
    }
  };

  const getDaysRemaining = (med: TrackedMedicine): number => {
    const totalDays = Math.ceil(med.totalQty / med.dosagePerDay);
    const start = new Date(med.startDate);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, totalDays - daysPassed);
  };

  const getPercentLeft = (med: TrackedMedicine): number => {
    const totalDays = Math.ceil(med.totalQty / med.dosagePerDay);
    if (totalDays === 0) return 0;
    const remaining = getDaysRemaining(med);
    return Math.min(100, Math.max(0, (remaining / totalDays) * 100));
  };

  const scheduleNotification = async (med: TrackedMedicine & { id: string }): Promise<string | undefined> => {
    const totalDays = Math.ceil(med.totalQty / med.dosagePerDay);
    const notifyAfterDays = totalDays - med.reminderDaysBefore;

    if (notifyAfterDays <= 0) {
      // Medicine will run out before we can remind them, notify immediately
      return undefined;
    }

    const triggerDate = new Date(med.startDate);
    triggerDate.setDate(triggerDate.getDate() + notifyAfterDays);
    triggerDate.setHours(9, 0, 0, 0); // Notify at 9 AM

    // Only schedule if the trigger date is in the future
    if (triggerDate.getTime() <= Date.now()) {
      return undefined;
    }

    try {
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Medicine Running Low!',
          body: `Your "${med.name}" will run out in ${med.reminderDaysBefore} days. Time to reorder!`,
          sound: 'default',
          data: { medicineId: med.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: Platform.OS === 'android' ? 'medicine-refill' : undefined,
        },
      });
      return notifId;
    } catch (e) {
      console.error('Failed to schedule notification:', e);
      return undefined;
    }
  };

  const addTrackedMedicine = async (medData: Omit<TrackedMedicine, 'id'>) => {
    const id = `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMed: TrackedMedicine = { ...medData, id };

    // Schedule notification
    const notificationId = await scheduleNotification(newMed);
    newMed.notificationId = notificationId;

    const updated = [...trackedMedicines, newMed];
    setTrackedMedicines(updated);
    await saveToStorage(updated);
  };

  const removeTrackedMedicine = async (id: string) => {
    const med = trackedMedicines.find(m => m.id === id);
    if (med?.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(med.notificationId);
      } catch (e) {
        // Notification may have already fired
      }
    }
    const updated = trackedMedicines.filter(m => m.id !== id);
    setTrackedMedicines(updated);
    await saveToStorage(updated);
  };

  return (
    <MedicineTrackerContext.Provider
      value={{
        trackedMedicines,
        addTrackedMedicine,
        removeTrackedMedicine,
        getDaysRemaining,
        getPercentLeft,
        loading,
      }}
    >
      {children}
    </MedicineTrackerContext.Provider>
  );
};
