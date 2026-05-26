// Recording composable for saving EEG data
import { ref, computed } from 'vue';

export function useRecording() {
  const isRecording = ref(false);
  const recordedData = ref([]);
  const recordingStartTime = ref(null);
  const recordingDuration = ref(0);
  
  const hasRecordedData = computed(() => recordedData.value.length > 0);
  
  function startRecording() {
    recordedData.value = [];
    recordingStartTime.value = Date.now();
    isRecording.value = true;
    recordingDuration.value = 0;
  }
  
  function stopRecording() {
    isRecording.value = false;
    if (recordingStartTime.value) {
      recordingDuration.value = Date.now() - recordingStartTime.value;
    }
  }
  
  function addSample(sample) {
    if (isRecording.value) {
      recordedData.value.push({
        timestamp: Date.now(),
        data: sample
      });
    }
  }
  
  function clearRecording() {
    recordedData.value = [];
    recordingDuration.value = 0;
    recordingStartTime.value = null;
  }
  
  function downloadCSV(filename = 'eeg_data.csv') {
    if (recordedData.value.length === 0) return;
    
    // Build CSV header
    const headers = ['timestamp'];
    const firstSample = recordedData.value[0].data;
    
    if (Array.isArray(firstSample)) {
      // Multiple channels
      for (let i = 0; i < firstSample.length; i++) {
        headers.push(`channel_${i}`);
      }
    } else if (typeof firstSample === 'object') {
      // Object with named channels
      headers.push(...Object.keys(firstSample));
    } else {
      headers.push('value');
    }
    
    // Build CSV rows
    const rows = recordedData.value.map(record => {
      const row = [record.timestamp];
      
      if (Array.isArray(record.data)) {
        row.push(...record.data);
      } else if (typeof record.data === 'object') {
        row.push(...Object.values(record.data));
      } else {
        row.push(record.data);
      }
      
      return row.join(',');
    });
    
    // Create CSV content
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
  
  function downloadJSON(filename = 'eeg_data.json') {
    if (recordedData.value.length === 0) return;
    
    const jsonContent = JSON.stringify(recordedData.value, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
  
  return {
    // State
    isRecording,
    recordedData,
    recordingDuration,
    
    // Computed
    hasRecordedData,
    
    // Methods
    startRecording,
    stopRecording,
    addSample,
    clearRecording,
    downloadCSV,
    downloadJSON
  };
}
