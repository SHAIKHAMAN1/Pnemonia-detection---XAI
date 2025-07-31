import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'pneumonia_model_final.keras')
model = load_model(MODEL_PATH)

# Prediction class labels (based on your binary classification: 0 = Normal, 1 = Pneumonia)
class_labels = {0: "Normal", 1: "Pneumonia"}

def preprocess_image(img_path, target_size=(224, 224)):
    """Preprocess input image: resize, normalize."""
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img)
    img_array = img_array / 255.0  # Normalize to [0, 1]
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array

def predict_diagnosis(img_path):
    """Predict class (Pneumonia or Normal) from input X-ray image."""
    try:
        img_tensor = preprocess_image(img_path)
        prediction = model.predict(img_tensor)[0][0]
        predicted_class = int(prediction > 0.5)
        confidence = float(prediction) if predicted_class == 1 else 1 - float(prediction)
        label = class_labels[predicted_class]
        return {
            "label": label,
            "confidence": round(confidence * 100, 2)
        }
    except Exception as e:
        return {"error": str(e)}
