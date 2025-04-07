from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# Define sample symptoms and conditions
sample_symptoms = [
    'fever', 'cough', 'shortness of breath', 'fatigue', 'headache',
    'sore throat', 'congestion', 'nausea', 'vomiting', 'diarrhea',
    'body aches', 'loss of taste or smell', 'chills', 'dizziness'
]

sample_conditions = [
    'Common Cold', 'Influenza', 'COVID-19', 'Allergies', 'Bronchitis',
    'Pneumonia', 'Sinusitis', 'Gastroenteritis', 'Migraine', 'Dehydration'
]

# Simple condition-symptom mapping for demonstration
condition_symptoms = {
    'Common Cold': ['cough', 'congestion', 'sore throat', 'fatigue'],
    'Influenza': ['fever', 'body aches', 'fatigue', 'headache', 'cough'],
    'COVID-19': ['fever', 'cough', 'shortness of breath', 'loss of taste or smell', 'fatigue'],
    'Allergies': ['congestion', 'sore throat', 'headache'],
    'Bronchitis': ['cough', 'shortness of breath', 'fatigue'],
    'Pneumonia': ['fever', 'cough', 'shortness of breath', 'fatigue'],
    'Sinusitis': ['congestion', 'headache', 'sore throat'],
    'Gastroenteritis': ['nausea', 'vomiting', 'diarrhea'],
    'Migraine': ['headache', 'nausea', 'dizziness'],
    'Dehydration': ['fatigue', 'dizziness', 'headache']
}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        user_symptoms = data.get('symptoms', [])

        # Convert symptoms to lowercase for matching
        user_symptoms_lower = [s.lower() for s in user_symptoms]

        # Calculate simple probability based on symptom overlap
        results = []
        for condition, symptoms in condition_symptoms.items():
            # Count matching symptoms
            matching = sum(1 for s in symptoms if s in user_symptoms_lower)
            total = len(symptoms)

            # Calculate probability (with some randomness for demonstration)
            if matching > 0:
                base_prob = matching / total
                # Add some randomness (±20%)
                prob = min(1.0, max(0.0, base_prob + random.uniform(-0.2, 0.2)))
            else:
                prob = random.uniform(0.0, 0.2)  # Small random probability if no matches

            # Determine if consultation is recommended based on probability
            recommend_consultation = prob > 0.5

            results.append({
                'name': condition,
                'probability': round(float(prob), 2),
                'recommendConsultation': recommend_consultation
            })

        # Sort by probability
        results = sorted(results, key=lambda x: x['probability'], reverse=True)

        return jsonify({
            'predictions': results
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

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
    app.run(host='0.0.0.0', port=5000, debug=True)
