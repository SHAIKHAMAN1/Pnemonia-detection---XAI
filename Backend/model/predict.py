import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os
from flask import Flask, request, jsonify
from model.explainers import generate_explanations # You should have this function

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'pneumonia_model_final.keras')
model = load_model(MODEL_PATH)

# Class labels
class_labels = {0: "Normal", 1: "Pneumonia"}

def preprocess_image(img_path, target_size=(224, 224)):
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict_diagnosis(img_path):
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

# Flask app and route
app = Flask(__name__)

@app.route('/explain', methods=['POST'])
def explain_route():
    image_file = request.files.get('image')
    patient_id = request.form.get('patientId')

    if not image_file or not patient_id:
        return jsonify({'error': 'Missing image or patientId'}), 400

    # Create directory for this patient
    save_dir = os.path.join('static', 'patient_data', patient_id)
    os.makedirs(save_dir, exist_ok=True)

    # Save image
    img_path = os.path.join(save_dir, image_file.filename)
    image_file.save(img_path)

    # Predict
    prediction = predict_diagnosis(img_path)

    # Generate explanation images
    generate_explanations(model, img_path, save_dir)  # Saves gradcam.png, lime.png, occlusion.png

    # Add image paths to response
    response = {
        "label": prediction["label"],
        "confidence": prediction["confidence"],
        "gradcam": f"/static/patient_data/{patient_id}/gradcam.png",
        "lime": f"/static/patient_data/{patient_id}/lime.png",
        "occlusion": f"/static/patient_data/{patient_id}/occlusion.png"
    }

    return jsonify(response)
