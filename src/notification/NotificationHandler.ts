import * as Notifications from 'expo-notifications';
import {Alert, Platform} from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === 'granted';
  }
  return true;
};

export const setupNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
    });
  }
};

export const presentCalculationNotification = async (calculation: {
  firstNumber: string;
  secondNumber: string;
  operation: string;
  result: number;
}) => {
  try {
    console.log("Attempting to schedule notification...");
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "New Calculation",
        body: `${calculation.firstNumber} ${calculation.operation} ${calculation.secondNumber} = ${calculation.result}`,
        sound: true
      },
      trigger: null,
    });
    console.log("Notification scheduled successfully.");
  } catch (error) {
    console.error("Error scheduling notification:", error);
    Alert.alert("Notification Error", "Failed to schedule notification.");
  }
};

export const sendTestNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification.",
        sound: true
      },
      trigger: null,
    });
    console.log("Test notification scheduled successfully.");
  } catch (error) {
    console.error("Error scheduling test notification:", error);
  }
};