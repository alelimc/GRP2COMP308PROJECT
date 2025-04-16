# Healthcare AI Prediction Microservice

A Flask-based microservice that uses deep learning to predict medical conditions based on symptoms and vital signs. The service uses a TensorFlow model trained on synthetic medical data.

## Features

- Predicts 10 different medical conditions:
  - Common Cold
  - Influenza
  - COVID-19
  - Allergies
  - Bronchitis
  - Pneumonia
  - Sinusitis
  - Gastroenteritis
  - Migraine
  - Dehydration

- Processes both symptoms and vital signs for predictions
- Returns probability scores and consultation recommendations
- Provides health check and symptoms list endpoints

## Technical Details

### Model Architecture
- Multi-Layer Perceptron (MLP) using TensorFlow
- Input layer: 18 features (13 symptoms + 5 vital signs)
- Hidden layer: 64 neurons with ReLU activation
- Output layer: 10 neurons with softmax activation (one per condition)
- Trained using sparse categorical crossentropy loss

### Input Features

#### Symptoms (13 binary indicators):
- cough
- fever
- congestion or runny nose
- sore throat
- fatigue
- body aches
- headache
- shortness of breath
- loss of taste or smell
- nausea or vomiting
- diarrhea
- dizziness
- chills

#### Vital Signs (5 measurements):
- Body Temperature (°C)
- Heart Rate (bpm)
- Systolic Blood Pressure (mmHg)
- Diastolic Blood Pressure (mmHg)
- Respiratory Rate (breaths/min)

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
    "status": "healthy"
}
```

### GET /symptoms
Returns list of recognized symptoms.

**Response:**
```json
{
    "symptoms": ["cough", "fever", "congestion or runny nose", ...]
}
```

### POST /predict
Analyzes symptoms and vital signs to predict conditions.

**Request Body:**
```json
{
    "symptoms": ["fever", "cough", "fatigue"],
    "vitalSigns": [38.5, 95, 120, 80, 18]
}
```

**Response:**
```json
{
    "predictions": [
        {
            "name": "COVID-19",
            "probability": 0.75,
            "recommendConsultation": true
        },
        {
            "name": "Influenza",
            "probability": 0.65,
            "recommendConsultation": true
        },
        {
            "name": "Common Cold",
            "probability": 0.45,
            "recommendConsultation": false
        }
    ]
}
```

## Prerequisites

- Python 3.8 to 3.11
- TensorFlow 2.x
- Flask
- NumPy
- scikit-learn

## Installation

1. Create and activate a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

3. Generate training data (optional):
```bash
node generateDataset.js
```

4. Train the model (optional):
```bash
python train_model.py
```

## Running the Service

Start the service:
```bash
python app.py
```

The service will run on http://localhost:5000

## Development

### Training Data
- Synthetic data generated using `generateDataset.js`
- 500 records with realistic vital signs ranges
- Symptom patterns based on medical conditions
- Data stored in `vital-signs.json`

### Model Training
- Uses K-fold cross-validation
- Trains on combined symptoms and vital signs
- Saves model as `disease_prediction_model_v4.h5`

## Notes

This is a simplified implementation for educational purposes. In a production environment:
- Use real medical data for training
- Implement proper security measures
- Add input validation
- Include more comprehensive error handling
- Add proper logging
- Implement model versioning
- Add monitoring and metrics
