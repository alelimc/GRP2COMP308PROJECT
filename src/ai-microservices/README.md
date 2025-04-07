# AI Microservice for Healthcare Monitoring System

This is a simple Flask-based microservice that provides AI functionality for the Healthcare Monitoring System. It analyzes patient symptoms and predicts possible medical conditions.

## Installation

### Prerequisites
- Python 3.6 or higher

### Setup

1. Install the required packages:
   ```
   pip install flask flask-cors
   ```

   Or using the requirements file:
   ```
   pip install -r requirements.txt
   ```

## Running the Service

Start the service with:
```
python app.py
```

The service will run on http://localhost:5000

## API Endpoints

### GET /health
Health check endpoint to verify the service is running.

### GET /symptoms
Returns a list of recognized symptoms.

### POST /predict
Analyzes symptoms and returns predicted medical conditions.

#### Request Body
```json
{
  "symptoms": ["fever", "cough", "fatigue"]
}
```

#### Response
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
    ...
  ]
}
```

## Notes

This is a simplified implementation. In a production environment, you would use a properly trained machine learning model based on real medical data.
