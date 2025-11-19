# from flask import Flask, request, jsonify
# import os
# import json
# from datetime import datetime
# from flask_cors import CORS
# from model.predict import predict_diagnosis
# from model.explainers import generate_explanations

# # ==== PATH SETUP ====
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
# PATIENT_FOLDER = os.path.join(BASE_DIR, 'static', 'patient_data')

# # Ensure folders exist
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# os.makedirs(PATIENT_FOLDER, exist_ok=True)

# # ==== FLASK SETUP ====
# app = Flask(__name__)
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# CORS(app, origins=["http://localhost:5173"])

# # ==== /predict: Basic prediction only ====
# @app.route('/predict', methods=['POST'])
# def predict():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file part'}), 400

#     file = request.files['file']
#     if file.filename == '':
#         return jsonify({'error': 'No file selected'}), 400

#     # Save uploaded image
#     filename = file.filename
#     file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#     file.save(file_path)

#     # Extract patient metadata
#     patient_info = {
#         "patientName": request.form.get('patientName'),
#         "patientId": request.form.get('patientId'),
#         "patientAge": request.form.get('patientAge'),
#         "patientGender": request.form.get('patientGender'),
#         "imageFilename": filename,
#         "timestamp": datetime.now().isoformat()
#     }

#     # Save metadata as JSON
#     json_path = os.path.join(PATIENT_FOLDER, f"{filename}.json")
#     with open(json_path, 'w') as f:
#         json.dump(patient_info, f, indent=4)

#     # Run prediction
#     result = predict_diagnosis(file_path)

#     return jsonify({
#         "label": result["label"],
#         "confidence": result["confidence"],
#         "patientInfo": patient_info
#     })


# # ==== /explain: Run explanation only ====
# @app.route('/explain', methods=['POST'])
# def explain():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file part'}), 400

#     file = request.files['file']
#     patient_id = request.form['patient_id']
#     if file.filename == '':
#         return jsonify({'error': 'No file selected'}), 400

#     # Save image
#     filename = file.filename
#     file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#     file.save(file_path)

#     # Run explanation pipeline
#     xai_result = generate_explanations(file_path,patient_id)

#     return jsonify({
#         "label": xai_result["label"],
#         "confidence": xai_result["confidence"],
#         "gradcam": xai_result["gradcam"],
#         "lime": xai_result["lime"],
#         "occlusion": xai_result["occlusion"]
#     })


# # ==== START APP ====
# print("Starting Flask App...")

# if __name__ == '__main__':
#     app.run(debug=True)



from flask import Flask, request, jsonify, url_for
import os
import json
from datetime import datetime
from flask_cors import CORS
from flask import url_for
from werkzeug.utils import secure_filename
from model.predict import predict_diagnosis
from model.explainers import generate_explanations
import uuid

# ==== PATH SETUP ====
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
PATIENT_FOLDER = os.path.join(BASE_DIR, 'static', 'patient_data')
EXPLANATIONS_FOLDER = os.path.join(BASE_DIR, 'static', 'explanations')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PATIENT_FOLDER, exist_ok=True)
os.makedirs(EXPLANATIONS_FOLDER, exist_ok=True)

# ==== FLASK SETUP ====
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# allow 5173 (vite) and 3000 (create-react-app) in dev
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# optionally limit upload size (uncomment if desired)
# app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB


def _save_upload_file(file_storage):
    """Sanitize filename, add uuid suffix, save file, and return filename & path."""
    orig = secure_filename(file_storage.filename)
    if not orig:
        orig = f"upload_{uuid.uuid4().hex}.jpg"
    name, ext = os.path.splitext(orig)
    unique_name = f"{name}_{uuid.uuid4().hex}{ext}"
    path = os.path.join(app.config['UPLOAD_FOLDER'], unique_name)
    file_storage.save(path)
    return unique_name, path


def _make_public_url(path_relative):
    # If you return absolute URLs, frontend doesn't have to join
    # request.host_url includes trailing slash; remove extra slashes properly
    return request.host_url.rstrip('/') + '/' + path_relative.lstrip('/')


# ==== /predict: Basic prediction only ====
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filename, file_path = _save_upload_file(file)

    # Extract patient metadata (use get so missing fields don't crash)
    patient_info = {
        "patientName": request.form.get('patientName'),
        "patientId": request.form.get('patientId') or request.form.get('patient_id'),
        "patientAge": request.form.get('patientAge'),
        "patientGender": request.form.get('patientGender'),
        "imageFilename": filename,
        "timestamp": datetime.now().isoformat()
    }

    # Save metadata as JSON
    json_path = os.path.join(PATIENT_FOLDER, f"{filename}.json")
    try:
        with open(json_path, 'w') as f:
            json.dump(patient_info, f, indent=4)
    except Exception as e:
        app.logger.exception("Failed to write patient JSON: %s", e)

    # Run prediction (wrap in try/except in case underlying model throws)
    try:
        result = predict_diagnosis(file_path)
    except Exception as e:
        app.logger.exception("Prediction error: %s", e)
        return jsonify({'error': 'Prediction failed', 'detail': str(e)}), 500

    return jsonify({
        "label": result.get("label"),
        "confidence": result.get("confidence"),
        "patientInfo": patient_info
    })


# ==== /explain: Run explanation only ====
# @app.route('/explain', methods=['POST'])
# def explain():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file part'}), 400

#     file = request.files['file']
#     # Accept both patientId and patient_id to be robust
#     patient_id = request.form.get('patientId') or request.form.get('patient_id')
#     if not patient_id:
#         # return friendly error instead of KeyError
#         return jsonify({'error': 'Missing patientId/patient_id in form data'}), 400

#     if file.filename == '':
#         return jsonify({'error': 'No file selected'}), 400

#     filename, file_path = _save_upload_file(file)

#     # Run explanation pipeline safely
#     try:
#         # generate_explanations should save output images into EXPLANATIONS_FOLDER and return relative paths or filenames
#         xai_result = generate_explanations(file_path, patient_id, explanations_dir=EXPLANATIONS_FOLDER)
#     except TypeError:
#         # if your existing generate_explanations signature doesn't accept explanations_dir, call without it
#         try:
#             xai_result = generate_explanations(file_path, patient_id)
#         except Exception as e:
#             app.logger.exception("Explanation pipeline failed: %s", e)
#             return jsonify({'error': 'Explanation failed', 'detail': str(e)}), 500
#     except Exception as e:
#         app.logger.exception("Explanation pipeline failed: %s", e)
#         return jsonify({'error': 'Explanation failed', 'detail': str(e)}), 500


from flask import current_app

@app.route('/explain', methods=['POST'])
def explain():
    try:
        if 'file' not in request.files:
            current_app.logger.warning("/explain called without file")
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        patient_id = request.form.get('patientId') or request.form.get('patient_id')
        if not patient_id:
            current_app.logger.warning("/explain missing patientId; form keys: %s", list(request.form.keys()))
            return jsonify({'error': 'Missing patientId/patient_id in form data'}), 400

        if file.filename == '':
            current_app.logger.warning("/explain called with empty filename")
            return jsonify({'error': 'No file selected'}), 400

        # Save upload
        filename, file_path = _save_upload_file(file)
        current_app.logger.info("Saved upload for explain: patient_id=%s filename=%s path=%s",
                                patient_id, filename, file_path)

        # Run explanation pipeline, catch errors from the model/explainer
        try:
            xai_result = generate_explanations(file_path, patient_id)
        except Exception as e:
            current_app.logger.exception("generate_explanations threw an exception")
            return jsonify({'error': 'Explanation pipeline failed', 'detail': str(e)}), 500

        # Defensive checks: ensure xai_result is a dict with required keys
        if not xai_result or not isinstance(xai_result, dict):
            current_app.logger.error("generate_explanations returned invalid result: %s", repr(xai_result))
            return jsonify({'error': 'Explanation pipeline returned invalid result'}), 500

        # Log result for debugging
        current_app.logger.debug("xai_result: %s", json.dumps(xai_result))

        # Normalize/resolve images to full public URLs
        def _resolve_img_path(img_value):
            if not img_value:
                return None
            if isinstance(img_value, str) and (img_value.startswith('http://') or img_value.startswith('https://')):
                return img_value
            # normalize backslashes
            rel = str(img_value).replace('\\', '/').lstrip('/')
            if rel.startswith('static/'):
                rel = rel[len('static/'):]
            if not rel.startswith('explanations/'):
                rel = f"explanations/{rel}"
            return url_for('static', filename=rel, _external=True)

        try:
            gradcam_url = _resolve_img_path(xai_result.get('gradcam'))
            lime_url = _resolve_img_path(xai_result.get('lime'))
            occlusion_url = _resolve_img_path(xai_result.get('occlusion'))
        except Exception as e:
            current_app.logger.exception("Failed to resolve image URLs")
            return jsonify({'error': 'Failed to build image URLs', 'detail': str(e)}), 500

        # Final sanity log: check files exist (only for local debugging)
        try:
            for rel in (xai_result.get('gradcam'), xai_result.get('lime'), xai_result.get('occlusion')):
                if rel:
                    p = os.path.join(BASE_DIR, 'static', str(rel).replace('\\', '/').lstrip('/').replace('explanations/', 'explanations/'))
                    current_app.logger.debug("Checking exists -> %s : %s", p, os.path.exists(p))
        except Exception:
            current_app.logger.exception("Error while checking generated files")

        # Return the JSON
        return jsonify({
            "label": xai_result.get("label"),
            "confidence": xai_result.get("confidence"),
            "gradcam": gradcam_url,
            "lime": lime_url,
            "occlusion": occlusion_url
        }), 200

    except Exception as e:
        # Catch any unexpected top-level failures so Flask always gets a response
        current_app.logger.exception("Unhandled exception in /explain")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

    # Build stable public URLs for explain images. Adjust according to how generate_explanations returns paths.
    # Assume xai_result returns filenames like "some_gradcam.png" stored in EXPLANATIONS_FOLDER or relative paths.
    # def _resolve_img_path(img_value):
    #     if not img_value:
    #         return None
    #     # If img_value is already absolute (starts with http), return it as-is
    #     if img_value.startswith('http://') or img_value.startswith('https://'):
    #         return img_value
    #     # If it's a path relative to static (e.g., "explanations/xxx.png"), create host_url-based URL
    #     # Prefer returning a path starting with /static/ so frontend can join with backend base if needed
    #     rel = img_value
    #     if not rel.startswith('static/'):
    #         rel = os.path.join('static', 'explanations', rel)
    #     return _make_public_url(rel)

    # gradcam_url = _resolve_img_path(xai_result.get('gradcam'))
    # lime_url = _resolve_img_path(xai_result.get('lime'))
    # occlusion_url = _resolve_img_path(xai_result.get('occlusion'))

    # return jsonify({
    #     "label": xai_result.get("label"),
    #     "confidence": xai_result.get("confidence"),
    #     "gradcam": gradcam_url,
    #     "lime": lime_url,
    #     "occlusion": occlusion_url
    # })

def _resolve_img_path(img_value):
    """
    img_value can be:
      - an absolute URL (http://...), return it as-is
      - a relative path like "explanations/12/gradcam.png" or r"explanations\\12\\gradcam.png"
      - a path that accidentally includes "static/" prefix
    This function normalizes to a static URL: http://host/static/explanations/12/gradcam.png
    """
    if not img_value:
        return None

    # if already absolute, return unchanged
    if img_value.startswith("http://") or img_value.startswith("https://"):
        return img_value

    # normalize backslashes to forward slashes and strip leading slashes
    rel = img_value.replace('\\', '/').lstrip('/')

    # If caller included 'static/' remove it (url_for will add it)
    if rel.startswith('static/'):
        rel = rel[len('static/'):]

    # Ensure path starts with 'explanations/'
    if not rel.startswith('explanations/'):
        rel = f"explanations/{rel}"

    # Use url_for to build the public URL (produces forward slashes)
    return url_for('static', filename=rel, _external=True)


# ==== START APP ====
print("Starting Flask App...")
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

