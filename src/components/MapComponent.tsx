import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const FACTORY_LOCATIONS = [
  { id: 1, lat: -6.2325, lon: 106.5449 },
  { id: 2, lat: -6.1756, lon: 106.6299 },
];

const RADIUS_METERS = 1000;

interface MapComponentProps {
  onLocationVerified?: (isInside: boolean, coords?: { lat: number, lon: number }) => void;
}

export default function MapComponent({ onLocationVerified }: MapComponentProps) {
  const [isInside, setIsInside] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          const inside = FACTORY_LOCATIONS.some(factory =>
            calculateDistance(latitude, longitude, factory.lat, factory.lon) <= RADIUS_METERS
          );
          setIsInside(inside);
          if (onLocationVerified) onLocationVerified(inside, { lat: latitude, lon: longitude });
        }
      );
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBadge, isInside ? styles.successBadge : styles.errorBadge]}>
        <Ionicons
          name={isInside ? 'location' : 'location-outline'}
          size={20}
          color={isInside ? '#4CAF50' : '#F44336'}
        />
        <Text style={[styles.statusText, { color: isInside ? '#4CAF50' : '#F44336' }]}>
          {isInside === null ? 'Memeriksa Lokasi...' : (isInside ? 'Dalam Area' : 'Luar Area')}
        </Text>
      </View>
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  successBadge: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  errorBadge: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

