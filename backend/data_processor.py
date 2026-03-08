from scipy.io import loadmat
import numpy as np
from sklearn.preprocessing import StandardScaler

def process_mat_file(file_path, window_size=200, step_size=100, emg_key='emg', label_key='stimulus'):
    """
    Processes a single .mat file using the logic provided by the user.
    """
    try:
        data = loadmat(file_path)
        
        if emg_key not in data:
            return None, f"Key '{emg_key}' not found in file."
            
        emg_signal = data[emg_key]
        
        # We might not strictly need the label for inference, but let's extract it if present
        # to ensure the structure matches what the user's code expected.
        label = None
        if label_key in data:
            label = data[label_key].flatten()[0]
        
        # Scale data
        # Note: In a real production environment, you should use the scaler fitted on the training data.
        # Here we mimic the user's script which fitted a new scale per batch.
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(emg_signal)
        
        # Windowing
        X_windowed = []
        y_windowed = []
        
        num_samples = X_scaled.shape[0]
        
        for i in range(0, num_samples - window_size + 1, step_size):
            window_data = X_scaled[i : i + window_size]
            X_windowed.append(window_data)
            
            if label is not None:
                y_windowed.append(label)
                
        X_windowed = np.array(X_windowed)
        y_windowed = np.array(y_windowed) if y_windowed else None
        
        if X_windowed.size == 0:
             return None, "Not enough data for the specified window size."
             
        return {
            'X_windowed': X_windowed,
            'y_windowed': y_windowed, # May be None
            'original_label': label
        }, None
        
    except Exception as e:
         return None, str(e)
