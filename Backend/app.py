# backend/app.py
from flask import Flask, request, jsonify
import os
from flask_cors import CORS  # ← Add this
from model.predict import predict_diagnosis

UPLOAD_FOLDER = os.path.join('static', 'uploads')

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app, origins=["http://localhost:5173"])

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Save uploaded image
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    # Run prediction
    result = predict_diagnosis(file_path)

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
