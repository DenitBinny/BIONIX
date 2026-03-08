import os
import tensorflow as tf
from keras.layers import LayerNormalization, MultiHeadAttention, Dense, Dropout, Conv1D, GlobalAveragePooling1D, BatchNormalization, Input
from keras.models import Model
import numpy as np

# Need to provide custom objects when loading the model if it used custom functions
def transformer_block(x, head_size, num_heads, ff_dim, dropout=0.1):
    x_norm = LayerNormalization(epsilon=1e-6)(x)
    attn_output = MultiHeadAttention(key_dim=head_size, num_heads=num_heads, dropout=dropout)(x_norm, x_norm)
    x = x + attn_output
    x_norm = LayerNormalization(epsilon=1e-6)(x)
    ffn_output = Dense(ff_dim, activation="relu")(x_norm)
    ffn_output = Dense(x.shape[-1])(ffn_output)
    ffn_output = Dropout(dropout)(ffn_output)
    return x + ffn_output

class EMGModelHandler:
    def __init__(self, model_path):
        self.model_path = model_path
        self.model = None

    def is_loaded(self):
        return self.model is not None

    def load_model(self):
        try:
            if not os.path.exists(self.model_path):
                print(f"Model file not found at {self.model_path}")
                return False
                
            # Using compile=False because we only need it for inference
            self.model = tf.keras.models.load_model(
                self.model_path, 
                compile=False,
                custom_objects={'transformer_block': transformer_block} # Include if needed by the saved model format
            )
            print(f"Model loaded successfully from {self.model_path}")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False

    def predict(self, input_data):
        if not self.is_loaded():
            raise RuntimeError("Model is not loaded.")
        
        # Predict
        predictions = self.model.predict(input_data)
        return predictions
