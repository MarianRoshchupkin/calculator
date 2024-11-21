import React, {useEffect, useRef} from 'react';
import {SafeAreaView, Alert} from 'react-native';
import {requestNotificationPermissions, setupNotificationChannel} from './src/notification/NotificationHandler';
import * as Notifications from 'expo-notifications';
import Keyboard from './src/ui/Keyboard/Keyboard';
import {Styles} from "./global.styles";

export default function App() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    const setupNotifications = async () => {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          "Permissions Required",
          "Please enable notifications to receive calculation alerts."
        );
      } else {
        console.log("Notification permissions granted.");
        await setupNotificationChannel();
      }
    };

    setupNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification Received in foreground:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification Response:", response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={Styles.container}>
      <Keyboard />
    </SafeAreaView>
  );
}