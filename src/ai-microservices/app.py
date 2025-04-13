import tensorflow as tf
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# Load the updated model, run train_model.py first
model = tf.keras.models.load_model('disease_prediction_model_v4.h5')

# Class names corresponding to diseases
class_names = [
    'Common Cold', 'Influenza', 'COVID-19', 'Allergies', 'Bronchitis',
    'Pneumonia', 'Sinusitis', 'Gastroenteritis', 'Migraine', 'Dehydration'
]

# Predefined list of symptoms
predefined_symptoms = [
    'cough', 'fever', 'congestion or runny nose', 'sore throat', 'fatigue',
    'body aches', 'headache', 'shortness of breath', 'loss of taste or smell',
    'nausea or vomiting', 'diarrhea', 'dizziness', 'chills'
]

@app.route('/')
def home():
    return "Disease Prediction API Microservice using MLP (Deep Learning)"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from POST request
        data = request.get_json()

        # Extract symptoms from the request payload
        request_symptoms = data.get('symptoms', [])
        request_symptoms = [symptom.lower().strip()for symptom in request_symptoms]
        symptoms = [1 if symptom in request_symptoms else 0 for symptom in predefined_symptoms]

        # Extract vital signs from the data
        vital_signs = data.get('vitalSigns', [])
    
        # Combine symptoms and vital signs into a single input array
        input_data = np.array([symptoms + vital_signs], dtype=np.float32)
        print('Input data:', input_data)
        
        # Get predictions
        results = get_predictions(input_data)

        print('Predictions:', results)
        return jsonify({
            'predictions': results
        })

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': str(e)})

def get_predictions(input_data, consultation_threshold=0.5, top_n=3):
    """
    Helper function to predict the condition and recommend consultation.
    """
    # Predict the probabilities for each class
    predictions = model.predict(input_data)[0]

    # Get the top N predictions
    top_indices = predictions.argsort()[-top_n:][::-1]

    results = []
    for idx in top_indices:
        results.append({
            'name': class_names[idx],
            'probability': float(predictions[idx]),
            'recommendConsultation': bool(predictions[idx] > consultation_threshold)
        })

    return results

@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    try:
        return jsonify({
            'symptoms': predefined_symptoms
        })
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)