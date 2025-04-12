import tensorflow as tf
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained model
model = tf.keras.models.load_model('disease_prediction_model_v3.h5')

# Defined class names corresponding to model output
class_names = [
    'Common Cold', 'Influenza', 'COVID-19', 'Allergies', 'Bronchitis',
    'Pneumonia', 'Sinusitis', 'Gastroenteritis', 'Migraine', 'Dehydration'
]

# Known symptoms the model was trained on (same order as training input)
model_symptoms = [
    'cough', 'fever', 'congestion', 'sore throat', 'fatigue', 'body aches',
    'headache', 'shortness of breath', 'loss of taste or smell',
    'nausea', 'vomiting', 'diarrhea', 'dizziness'
]

@app.route('/')
def home():
    return "Disease Prediction API Microservice using Multi-Layer Perceptron(Deep Learning)"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        user_symptoms = [sym.lower() for sym in data.get('symptoms', [])]

        # Convert user symptoms to binary input vector
        input_vector = [1 if symptom in user_symptoms else 0 for symptom in model_symptoms]

        # Predict
        prediction = model.predict(np.array([input_vector]))[0]  # shape (10,)
        
        results = []
        for i, prob in enumerate(prediction):
            results.append({
                'name': class_names[i],
                'probability': round(float(prob), 2),
                'recommendConsultation': float(prob) > 0.5
            })

        # Sort predictions by descending probability
        results = sorted(results, key=lambda x: x['probability'], reverse=True)

        return jsonify({
            'predictions': results
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    try:
        return jsonify({
            'symptoms': model_symptoms
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
