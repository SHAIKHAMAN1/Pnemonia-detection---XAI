# import os
# import numpy as np
# import tensorflow as tf
# import matplotlib.pyplot as plt
# import cv2
# from lime import lime_image
# from skimage.segmentation import mark_boundaries
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing.image import load_img, img_to_array

# # === GLOBAL SETTINGS ===
# XAI_VERBOSE = 0
# img_height, img_width = 224, 224
# STATIC_OUTPUT_DIR = os.path.join("backend", "static", "outputs")

# # Load model
# CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# MODEL_PATH = os.path.join(CURRENT_DIR, "pneumonia_model_final.keras")
# model = load_model(MODEL_PATH)

# # Find last conv layer for Grad-CAM
# last_conv_layer_name = next(
#     (layer.name for layer in reversed(model.layers) if isinstance(layer, tf.keras.layers.Conv2D)), 
#     None
# )


# def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
#     grad_model = tf.keras.models.Model(
#         [model.inputs], 
#         [model.get_layer(last_conv_layer_name).output, model.output]
#     )
#     with tf.GradientTape() as tape:
#         conv_output, preds = grad_model(img_array)
#         preds = tf.convert_to_tensor(preds)
#         if pred_index is None:
#             pred_index = tf.argmax(preds[0]).numpy().item()
#         class_output = preds[:, pred_index]

#     grads = tape.gradient(class_output, conv_output)
#     pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
#     conv_output = conv_output[0]
#     heatmap = conv_output @ pooled_grads[..., tf.newaxis]
#     heatmap = tf.squeeze(heatmap)
#     heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap + 1e-8)
#     return heatmap.numpy()


# def display_gradcam(original_img, heatmap, alpha=0.6):
#     heatmap = np.uint8(255 * heatmap)
#     jet = plt.cm.get_cmap("jet")
#     jet_colors = jet(np.arange(256))[:, :3]
#     jet_heatmap = jet_colors[heatmap]
#     jet_heatmap = tf.keras.preprocessing.image.array_to_img(jet_heatmap)
#     jet_heatmap = jet_heatmap.resize((original_img.shape[1], original_img.shape[0]))
#     jet_heatmap = img_to_array(jet_heatmap)
#     superimposed = jet_heatmap * alpha + original_img
#     return tf.keras.preprocessing.image.array_to_img(superimposed)


# def apply_lime(img_array, model):
#     def predict_fn(images):
#         return model.predict(np.array(images), verbose=XAI_VERBOSE)

#     explainer = lime_image.LimeImageExplainer(verbose=XAI_VERBOSE)
#     explanation = explainer.explain_instance(
#         img_array, predict_fn, top_labels=1, hide_color=0, num_samples=500
#     )
#     lime_img, mask = explanation.get_image_and_mask(
#         explanation.top_labels[0], positive_only=True, num_features=5, hide_rest=False
#     )
#     return mark_boundaries(lime_img, mask)


# def occlusion_sensitivity(img, model, patch_size=16):
#     orig_pred = model.predict(np.expand_dims(img, axis=0), verbose=XAI_VERBOSE)[0, 0]
#     height, width, _ = img.shape
#     sensitivity_map = np.zeros((height, width))

#     for h in range(0, height, patch_size):
#         for w in range(0, width, patch_size):
#             occluded = img.copy()
#             occluded[h:h+patch_size, w:w+patch_size, :] = 0.5
#             pred = model.predict(np.expand_dims(occluded, 0), verbose=XAI_VERBOSE)[0, 0]
#             sensitivity_map[h:h+patch_size, w:w+patch_size] = orig_pred - pred

#     norm_map = (sensitivity_map - sensitivity_map.min()) / (sensitivity_map.max() - sensitivity_map.min() + 1e-8)
#     return norm_map


# def generate_explanations(image_path, patient_id):
#     # Create per-patient subdirectory
#     output_dir = os.path.join(STATIC_OUTPUT_DIR, patient_id)
#     os.makedirs(output_dir, exist_ok=True)

#     # Load and preprocess image
#     img = load_img(image_path, target_size=(img_width, img_height))
#     img_array = img_to_array(img) / 255.0
#     img_batch = np.expand_dims(img_array, axis=0)

#     # Prediction
#     prediction = model.predict(img_batch, verbose=XAI_VERBOSE)[0, 0]
#     label = "PNEUMONIA" if prediction > 0.5 else "NORMAL"
#     confidence = prediction if prediction > 0.5 else 1 - prediction

#     # 1. Grad-CAM
#     heatmap = make_gradcam_heatmap(img_batch, model, last_conv_layer_name)
#     gradcam_img = display_gradcam(img_array, heatmap)
#     gradcam_path = os.path.join(output_dir, "gradcam.png")
#     gradcam_img.save(gradcam_path)

#     # 2. LIME
#     lime_vis = apply_lime(img_array, model)
#     lime_path = os.path.join(output_dir, "lime.png")
#     plt.imshow(lime_vis)
#     plt.axis('off')
#     plt.savefig(lime_path, bbox_inches='tight', pad_inches=0)
#     plt.close()

#     # 3. Occlusion Sensitivity
#     occ_map = occlusion_sensitivity(img_array, model, patch_size=32)
#     plt.imshow(img_array)
#     plt.imshow(occ_map, cmap='hot', alpha=0.5)
#     occlusion_path = os.path.join(output_dir, "occlusion.png")
#     plt.axis('off')
#     plt.savefig(occlusion_path, bbox_inches='tight', pad_inches=0)
#     plt.close()

#     # For frontend (return relative static paths)
#     return {
#         "label": label,
#         "confidence": round(confidence * 100, 2),
#         "gradcam": f"/static/outputs/{patient_id}/gradcam.png",
#         "lime": f"/static/outputs/{patient_id}/lime.png",
#         "occlusion": f"/static/outputs/{patient_id}/occlusion.png"
#     }



import os
import numpy as np
import tensorflow as tf
# Use non-interactive backend for server-side image creation
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import cv2
from lime import lime_image
from skimage.segmentation import mark_boundaries
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array

# === GLOBAL SETTINGS ===
XAI_VERBOSE = 0
img_height, img_width = 224, 224

# compute STATIC_OUTPUT_DIR relative to this module, so it's absolute and correct
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))              # backend/model
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))       # backend
STATIC_OUTPUT_DIR = os.path.join(PROJECT_ROOT, "static", "explanations")  # backend/static/explanations

os.makedirs(STATIC_OUTPUT_DIR, exist_ok=True)

# Load model
MODEL_PATH = os.path.join(CURRENT_DIR, "pneumonia_model_final.keras")
model = load_model(MODEL_PATH)

# Find last conv layer for Grad-CAM
last_conv_layer_name = next(
    (layer.name for layer in reversed(model.layers) if isinstance(layer, tf.keras.layers.Conv2D)),
    None
)


def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(last_conv_layer_name).output, model.output]
    )
    with tf.GradientTape() as tape:
        conv_output, preds = grad_model(img_array)
        preds = tf.convert_to_tensor(preds)
        if pred_index is None:
            # For binary classification with single output (sigmoid), use the prediction value
            # If prediction > 0.5, we're explaining class 1 (PNEUMONIA), else class 0 (NORMAL)
            if preds.shape[-1] == 1:
                pred_index = 0  # Single output neuron - always use index 0
            else:
                pred_index = tf.argmax(preds[0]).numpy().item()
        class_output = preds[:, pred_index]

    grads = tape.gradient(class_output, conv_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_output = conv_output[0]
    heatmap = conv_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    # FIX: Properly normalize the heatmap to [0, 1] range
    heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
    return heatmap.numpy()


def display_gradcam(original_img, heatmap, alpha=0.6):
    # Convert heatmap to 0-255 range
    heatmap = np.uint8(255 * heatmap)
    
    # Apply colormap
    jet = plt.cm.get_cmap("jet")
    jet_colors = jet(np.arange(256))[:, :3]
    jet_heatmap = jet_colors[heatmap]
    
    # Convert to PIL image and resize to match original
    jet_heatmap = tf.keras.preprocessing.image.array_to_img(jet_heatmap)
    jet_heatmap = jet_heatmap.resize((original_img.shape[1], original_img.shape[0]))
    jet_heatmap = img_to_array(jet_heatmap)
    
    # FIX: Convert original_img from [0, 1] to [0, 255] range for proper superimposition
    original_img_scaled = original_img * 255.0
    
    # Superimpose with alpha blending
    superimposed = jet_heatmap * alpha + original_img_scaled * (1 - alpha)
    
    # Ensure values are in valid range [0, 255]
    superimposed = np.clip(superimposed, 0, 255).astype(np.uint8)
    
    return tf.keras.preprocessing.image.array_to_img(superimposed)


def apply_lime(img_array, model):
    def predict_fn(images):
        return model.predict(np.array(images), verbose=XAI_VERBOSE)

    explainer = lime_image.LimeImageExplainer(verbose=XAI_VERBOSE)
    explanation = explainer.explain_instance(
        img_array, predict_fn, top_labels=1, hide_color=0, num_samples=500
    )
    lime_img, mask = explanation.get_image_and_mask(
        explanation.top_labels[0], positive_only=True, num_features=5, hide_rest=False
    )
    return mark_boundaries(lime_img, mask)


def occlusion_sensitivity(img, model, patch_size=16):
    orig_pred = model.predict(np.expand_dims(img, axis=0), verbose=XAI_VERBOSE)[0, 0]
    height, width, _ = img.shape
    sensitivity_map = np.zeros((height, width))

    for h in range(0, height, patch_size):
        for w in range(0, width, patch_size):
            occluded = img.copy()
            occluded[h:h+patch_size, w:w+patch_size, :] = 0.5
            pred = model.predict(np.expand_dims(occluded, 0), verbose=XAI_VERBOSE)[0, 0]
            sensitivity_map[h:h+patch_size, w:w+patch_size] = orig_pred - pred

    norm_map = (sensitivity_map - sensitivity_map.min()) / (sensitivity_map.max() - sensitivity_map.min() + 1e-8)
    return norm_map


def generate_explanations(image_path, patient_id):
    # ensure patient_id is string
    patient_id = str(patient_id)
    # Create per-patient subdirectory under static/explanations
    output_dir = os.path.join(STATIC_OUTPUT_DIR, patient_id)
    os.makedirs(output_dir, exist_ok=True)

    # Load and preprocess image
    img = load_img(image_path, target_size=(img_width, img_height))
    img_array = img_to_array(img) / 255.0
    img_batch = np.expand_dims(img_array, axis=0)

    # Prediction
    prediction = model.predict(img_batch, verbose=XAI_VERBOSE)[0, 0]
    label = "PNEUMONIA" if prediction > 0.5 else "NORMAL"
    confidence = prediction if prediction > 0.5 else 1 - prediction

    # 1. Grad-CAM
    heatmap = make_gradcam_heatmap(img_batch, model, last_conv_layer_name)
    gradcam_img = display_gradcam(img_array, heatmap)
    gradcam_path = os.path.join(output_dir, "gradcam.png")
    gradcam_img.save(gradcam_path)

    # 2. LIME
    lime_vis = apply_lime(img_array, model)
    lime_path = os.path.join(output_dir, "lime.png")
    plt.figure(figsize=(6, 6))
    plt.imshow(lime_vis)
    plt.axis('off')
    plt.savefig(lime_path, bbox_inches='tight', pad_inches=0)
    plt.close()

    # 3. Occlusion Sensitivity
    occ_map = occlusion_sensitivity(img_array, model, patch_size=32)
    plt.figure(figsize=(6, 6))
    plt.imshow(img_array)
    plt.imshow(occ_map, cmap='hot', alpha=0.5)
    occlusion_path = os.path.join(output_dir, "occlusion.png")
    plt.axis('off')
    plt.savefig(occlusion_path, bbox_inches='tight', pad_inches=0)
    plt.close()

    # Sanity: ensure files exist
    assert os.path.exists(gradcam_path), f"gradcam missing: {gradcam_path}"
    assert os.path.exists(lime_path), f"lime missing: {lime_path}"
    assert os.path.exists(occlusion_path), f"occlusion missing: {occlusion_path}"

    # Return relative paths under static/ so Flask can use url_for('static', filename=...)
    return {
        "label": label,
        "confidence": round(confidence * 100, 2),
        "gradcam": os.path.join("explanations", patient_id, "gradcam.png"),
        "lime": os.path.join("explanations", patient_id, "lime.png"),
        "occlusion": os.path.join("explanations", patient_id, "occlusion.png")
    }
