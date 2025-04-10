# -*- coding: utf-8 -*-
"""
Created on Thu Apr 10 03:16:49 2025
@author: Belenzo
"""
# app2.py
import tensorflow as tf
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app2 = Flask(__name__)
CORS(app2)

# Load the updated model, run train_model.py first
model = tf.keras.models.load_model('disease_prediction_model_v3.h5')

# Class names corresponding to diseases
class_names = [
    'Common Cold', 'Influenza', 'COVID-19', 'Allergies', 'Bronchitis',
    'Pneumonia', 'Sinusitis', 'Gastroenteritis', 'Migraine', 'Dehydration'
]

@app.route('/')
def home():
    return "Disease Prediction API Microservice using MLP (Deep Learning)"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from POST request
        data = request.get_json()
        results = []
        # Extract symptoms from the data
        symptoms = [
            data.get('cough', 0),
            data.get('fever', 0),
            data.get('congestion', 0),
            data.get('sore_throat', 0),
            data.get('fatigue', 0),
            data.get('body_aches', 0),
            data.get('headache', 0),
            data.get('shortness_of_breath', 0),
            data.get('loss_of_taste_or_smell', 0),
            data.get('nausea', 0),
            data.get('vomiting', 0),
            data.get('diarrhea', 0),
            data.get('dizziness', 0)
        ]

        # Prepare the input data (reshape it to match model input)
        input_data = np.array([symptoms])

        # Predict the disease
        prediction = model.predict(input_data)
        predicted_class = np.argmax(prediction)

        # Add recommend_consultation based on probability
        recommend_consultation = predicted_class > 0.5

        results.append({
            'name': class_names[predicted_class],
            'probability': float(prediction[0][predicted_class]),
            'recommendConsultation': recommend_consultation
        })

        # Sort by probability
        results = sorted(results, key=lambda x: x['probability'], reverse=True)

        return jsonify({
            'predictions': results
        })

    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    try:
        return jsonify({
            'symptoms': sample_symptoms
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
    app2.run(host='0.0.0.0', port=5000, debug=True)
