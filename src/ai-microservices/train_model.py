# -*- coding: utf-8 -*-
"""
Created on Thu Apr 10 02:25:38 2025
@author: Belenzo
"""

import tensorflow as tf
import numpy as np

# Expanded sample data (12 symptoms and 10 diseases)
X = np.array([
    [1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],  # Common Cold
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],  # Influenza
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],  # COVID-19
    [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0],  # Allergies
    [0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0],  # Bronchitis
    [1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0],  # Pneumonia
    [0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0],  # Sinusitis
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],  # Gastroenteritis
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],  # Migraine
    [0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0]   # Dehydration
], dtype=np.float32)

# Labels: Disease (encoded as numbers for simplicity)
y = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])  # Diseases: [0: Common Cold, ..., 9: Dehydration]

# Build a simple MLP model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(12,)),  # Adjust input size (12 symptoms)
    tf.keras.layers.Dense(10, activation='softmax')  # 10 possible diseases
])

# Compile the model
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# Train the model
model.fit(X, y, epochs=100)

# Save the model
model.save('disease_prediction_model_v3.h5')
print("Updated model trained and saved as disease_prediction_model_v3.h5")
