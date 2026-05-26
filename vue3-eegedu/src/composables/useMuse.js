// Muse connection composable
import { ref, computed } from 'vue';
import { MuseClient, zipSamples } from 'muse-js';
import { Observable } from 'rxjs';

export function useMuse() {
  const client = ref(null);
  const connectionStatus = ref('disconnected');
  const rawObservable = ref(null);
  const deviceInfo = ref(null);
  const batteryLevel = ref(null);
  
  const isConnected = computed(() => connectionStatus.value === 'connected');
  const isConnecting = computed(() => connectionStatus.value === 'connecting');
  
  async function connect() {
    try {
      connectionStatus.value = 'connecting';
      
      client.value = new MuseClient();
      
      // Set up connection status listener
      client.value.connectionStatus.subscribe(status => {
        connectionStatus.value = status ? 'connected' : 'disconnected';
      });
      
      // Connect to Muse
      await client.value.connect();
      await client.value.start();
      
      // Get device info
      deviceInfo.value = {
        name: client.value.deviceName,
        firmware: client.value.firmwareVersion
      };
      
      // Subscribe to battery level
      client.value.telemetryData.subscribe(telemetry => {
        batteryLevel.value = telemetry.batteryLevel;
      });
      
      // Create raw EEG observable
      rawObservable.value = new Observable(subscriber => {
        const subscription = zipSamples(client.value.eegReadings).subscribe(sample => {
          subscriber.next(sample);
        });
        
        return () => subscription.unsubscribe();
      });
      
      connectionStatus.value = 'connected';
      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      connectionStatus.value = 'disconnected';
      return false;
    }
  }
  
  function disconnect() {
    if (client.value) {
      client.value.disconnect();
      client.value = null;
    }
    rawObservable.value = null;
    connectionStatus.value = 'disconnected';
    deviceInfo.value = null;
    batteryLevel.value = null;
  }
  
  return {
    // State
    client,
    connectionStatus,
    rawObservable,
    deviceInfo,
    batteryLevel,
    
    // Computed
    isConnected,
    isConnecting,
    
    // Methods
    connect,
    disconnect
  };
}
