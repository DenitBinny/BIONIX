import sys
import os
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from model_training_pipeline import trigger_training_pipeline
import numpy as np

def test():
    pipeline_output, error = trigger_training_pipeline('uploads')
    if error:
        with open('test_results.json', 'w') as f:
            json.dump({'error': error}, f)
        return
        
    predictions = pipeline_output['predictions']
    y_test_true = pipeline_output['y_test_true']
    min_label = pipeline_output['min_label']
    label_to_folder = pipeline_output['label_to_folder']
    label_index_map = pipeline_output['label_index_map']
    
    pred_classes = np.argmax(predictions, axis=1).tolist()
    true_classes = np.argmax(y_test_true, axis=1).tolist()
    
    unique_pred = list(set(pred_classes))
    unique_true = list(set(true_classes))
    
    out = {
        'unique_pred': unique_pred,
        'unique_true': unique_true,
        'label_to_folder': label_to_folder,
        'label_index_map': label_index_map,
        'min_label': min_label
    }
    
    with open('test_results.json', 'w') as f:
        json.dump(out, f, indent=2)

if __name__ == '__main__':
    test()
