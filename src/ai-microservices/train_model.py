import tensorflow as tf
import numpy as np
import random
import os

# Reproducibility
seed = 42
np.random.seed(seed)
tf.random.set_seed(seed)
random.seed(seed)
os.environ['PYTHONHASHSEED'] = str(seed)

# === Base dataset ===
base_X = np.array([
    [1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],  # Common Cold
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],  # Influenza
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],  # COVID-19
    [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],  # Allergies
    [0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],  # Bronchitis
    [1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0],  # Pneumonia
    [0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0],  # Sinusitis
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0],  # Gastroenteritis
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],  # Migraine
    [0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0]   # Dehydration
], dtype=np.float32)

base_y = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

# === Data augmentation: Add 5 variations per disease ===
aug_X, aug_y = [], []
for i, row in enumerate(base_X):
    aug_X.append(row)
    aug_y.append(base_y[i])
    for _ in range(4):  # 4 more variations
        noise = np.random.binomial(1, 0.1, size=row.shape)  # 10% chance to flip
        new_row = np.clip(row + noise, 0, 1)
        aug_X.append(new_row)
        aug_y.append(base_y[i])

X = np.array(aug_X, dtype=np.float32)
y = np.array(aug_y)

# === Model definition ===
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(13,)),
    tf.keras.layers.Dense(128, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.001)),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.1),

    tf.keras.layers.Dense(64, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.001)),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.1),

    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])

# === Compile ===
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# === Train without early stopping ===
history = model.fit(
    X, y,
    epochs=400,
    batch_size=8,
    validation_split=0.2,
    verbose=1
)

# === Save model ===
model.save('disease_prediction_model_v3.h5')
print("Intensified model trained with richer data and saved as disease_prediction_model_v3.h5")
