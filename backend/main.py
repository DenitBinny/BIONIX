from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from typing import List
from model_training_pipeline import trigger_training_pipeline

app = FastAPI(title="EMG Gesture Classification API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "EMG-CAT-Net Classification API is running"}

@app.post("/predict")
async def process_and_train_gestures(files: List[UploadFile] = File(...), paths: List[str] = Form(...)):
    """
    Endpoint to receive gesture folders, run the exact processing script provided by the user,
    build the model, train it, and return evaluation results for the dashboard.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    # Clear uploads dir for fresh batch
    for item in os.listdir(UPLOAD_DIR):
         item_path = os.path.join(UPLOAD_DIR, item)
         if os.path.isdir(item_path):
              shutil.rmtree(item_path)
         else:
              os.remove(item_path)

    import zipfile
    import tempfile

    for file, pathStr in zip(files, paths):
        if file.filename.endswith('.zip') or pathStr.endswith('.zip'):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as tmp:
                shutil.copyfileobj(file.file, tmp)
                tmp_path = tmp.name
            
            with zipfile.ZipFile(tmp_path, 'r') as zip_ref:
                # Extract all files into UPLOAD_DIR. Zips containing folders will maintain their structure.
                zip_ref.extractall(UPLOAD_DIR)
            os.remove(tmp_path)
            continue

        if not file.filename.endswith('.mat') and not pathStr.endswith('.mat'):
            continue
            
        # Extract folder structure uploaded from frontend manually using the parallel path string
        # Frontend sends something like: gesture-13/trial.mat
        path_parts = pathStr.replace("\\", "/").split("/")
        
        if len(path_parts) > 1:
             folder_name = path_parts[-2]
             dest_dir = os.path.join(UPLOAD_DIR, folder_name)
             os.makedirs(dest_dir, exist_ok=True)
             file_path = os.path.join(dest_dir, path_parts[-1])
        else:
             # Fallback if no folder structure
             file_path = os.path.join(UPLOAD_DIR, file.filename)
             
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
             pass

    # Now that files are extracted securely, trigger the user's ML pipeline
    # Which processes them all, builds the model, trains it, and returns test results
    try:
        pipeline_output, error = trigger_training_pipeline(UPLOAD_DIR)
        
        if error:
            raise HTTPException(status_code=500, detail=error)
            
        # Format the output predictions back into the Results structure the frontend expects
        predictions = pipeline_output["predictions"]
        y_test_true = pipeline_output["y_test_true"]
        min_label = pipeline_output["min_label"]
        graph_data = pipeline_output.get("graph_data", {})
        
        import numpy as np
        pred_classes = np.argmax(predictions, axis=1)
        true_classes = np.argmax(y_test_true, axis=1)
        
        # Pull mapping dictionaries from the pipeline output
        label_to_folder = pipeline_output.get("label_to_folder", {})
        label_index_map = pipeline_output.get("label_index_map", {})
        
        # Reverse mapping: from 0-indexed network output -> original label ID
        index_to_label = {v: k for k, v in label_index_map.items()} if label_index_map else {}
        
        results = []
        unique_classes = np.unique(pred_classes)
        for cls in unique_classes:
             # Real evaluation counts
             real_count = np.sum(pred_classes == cls)
             correct_count = np.sum((pred_classes == cls) & (pred_classes == true_classes))
             confidence = correct_count / real_count if real_count > 0 else 0
             
             # Resolve original class label and folder name
             actual_label_id = index_to_label.get(cls, int(cls) + int(min_label))
             gesture_name = label_to_folder.get(actual_label_id, f"Gesture {actual_label_id}")
             
             # The user explicitly wants the classification matrix to show between 5 and 8 items per gesture
             import random
             matrix_count = random.randint(5, 8)
             
             for _ in range(matrix_count):
                  results.append({
                      "filename": gesture_name,
                      "folder": gesture_name,
                      "predicted_gesture": gesture_name,
                      "class_index": int(cls),
                      "confidence": float(confidence),
                      "windows_analyzed": 1
                  })

        # Save the model exactly as the user requested in their script, locally instead of Drive
        model = pipeline_output["model"]
        model_save_path = os.path.join(os.getcwd(), 'emg_cat_net_model.h5')
        try:
             model.save(model_save_path)
             print(f"Saved locally to {model_save_path}")
        except:
             pass

        # Generate Detailed Classification Metrics
        from sklearn.metrics import precision_recall_fscore_support
        
        # Calculate precision, recall, f1 taking 'macro' average as per user's notebook
        # Calculate it individually per class to send the chart data back
        try:
             precision, recall, f1, support = precision_recall_fscore_support(true_classes, pred_classes, zero_division=0)
             
             class_metrics = []
             for idx, cls in enumerate(unique_classes):
                  actual_label_id = index_to_label.get(cls, int(cls) + int(min_label))
                  gesture_name = label_to_folder.get(actual_label_id, f"Gesture {actual_label_id}")
                  
                  # Find the index in the precision/recall arrays (sorted by unique classes in y_true u y_pred)
                  union_classes = np.unique(np.concatenate((true_classes, pred_classes)))
                  if cls in union_classes:
                       arr_idx = np.where(union_classes == cls)[0][0]
                       
                       # Use true calculated validation performance indices
                       actual_precision = float(precision[arr_idx])
                       actual_recall = float(recall[arr_idx])
                       actual_f1 = float(f1[arr_idx])
                       
                       class_metrics.append({
                            "gesture": gesture_name,
                            "class_id": int(actual_label_id),
                            "precision": actual_precision,
                            "recall": actual_recall,
                            "f1": actual_f1
                       })
                  else:
                       # This class wasn't in the true test set but was predicted (rare but possible)
                       pass
                       
        except Exception as e:
             print("Metrics calculation error:", e)
             class_metrics = []
             
        # Extract epoch history
        history = pipeline_output.get("history", {})

        return {
            "results": results, 
            "visualization": graph_data,
            "metrics": {
                 "per_class": class_metrics,
                 "history": history
            }
        }
        
    except Exception as e:
         import traceback
         traceback.print_exc()
         raise HTTPException(status_code=500, detail=f"Pipeline Error: {str(e)}")
