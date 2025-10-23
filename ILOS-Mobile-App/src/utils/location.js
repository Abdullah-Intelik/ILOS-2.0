import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

/**
 * Location utility for tracking EAMVU officer locations
 */

// Request location permissions (Android)
export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'ILOS needs access to your location to verify field visit locations.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('📍 Location permission granted');
        return true;
      } else {
        console.log('📍 Location permission denied');
        return false;
      }
    } catch (err) {
      console.warn('📍 Location permission error:', err);
      return false;
    }
  }
  
  // iOS permissions are handled via Info.plist
  return true;
};

// Get current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          formattedTime: new Date(position.timestamp).toLocaleString(),
        };
        console.log('📍 Current location:', location);
        resolve(location);
      },
      (error) => {
        console.error('📍 Location error:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};

// Watch location (for continuous tracking)
export const watchLocation = (callback, errorCallback) => {
  const watchId = Geolocation.watchPosition(
    (position) => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };
      callback(location);
    },
    (error) => {
      console.error('📍 Watch location error:', error);
      if (errorCallback) errorCallback(error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10, // Update every 10 meters
      interval: 10000, // Update every 10 seconds
      fastestInterval: 5000,
    }
  );
  
  return watchId;
};

// Stop watching location
export const stopWatchingLocation = (watchId) => {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    console.log('📍 Stopped watching location');
  }
};

// Format location for display
export const formatLocation = (location) => {
  if (!location) return 'Location not available';
  
  return `Lat: ${location.latitude.toFixed(6)}, Long: ${location.longitude.toFixed(6)}`;
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
};

// Get Google Maps URL for location
export const getGoogleMapsUrl = (latitude, longitude) => {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

// Show location confirmation dialog
export const showLocationConfirmation = (location) => {
  return new Promise((resolve) => {
    Alert.alert(
      'Location Captured',
      `Your current location has been recorded:\n\n${formatLocation(location)}\n\nAccuracy: ${Math.round(location.accuracy)}m\nTime: ${location.formattedTime}`,
      [
        {
          text: 'View on Map',
          onPress: () => {
            const url = getGoogleMapsUrl(location.latitude, location.longitude);
            // You can use Linking.openURL(url) to open in maps
            resolve({ confirmed: true, action: 'view_map', url });
          },
        },
        {
          text: 'OK',
          onPress: () => resolve({ confirmed: true, action: 'ok' }),
        },
      ]
    );
  });
};

