import tensorflow as tf
import numpy as np
import json
from sklearn.model_selection import train_test_split, KFold

# Load data from vital-signs.json
with open('vital-signs.json', 'r') as file:  # Ensure the file path is correct
    vital_signs_data = json.load(file)

# Prepare the input features (X) and labels (y)
X = []
y = []

for record in vital_signs_data:
    # Combine symptoms and vital signs into a single feature array
    features = record['symptoms'] + [
        record['bodyTemperature'],
        record['heartRate'],
        record['systolic'],
        record['diastolic'],
        record['respiratoryRate']
    ]
    X.append(features)

    # Map the condition to a numerical label
    condition = record['condition']
    if condition == 'Common Cold':
        y.append(0)
    elif condition == 'Influenza':
        y.append(1)
    elif condition == 'COVID-19':
        y.append(2)
    elif condition == 'Allergies':
        y.append(3)
    elif condition == 'Bronchitis':
        y.append(4)
    elif condition == 'Pneumonia':
        y.append(5)
    elif condition == 'Sinusitis':
        y.append(6)
    elif condition == 'Gastroenteritis':
        y.append(7)
    elif condition == 'Migraine':
        y.append(8)
    elif condition == 'Dehydration':
        y.append(9)

# Convert X and y to NumPy arrays
X = np.array(X, dtype=np.float32)
y = np.array(y, dtype=np.int32)

# Split the dataset into training+validation (80%) and test (20%)
X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define the number of folds for cross-validation
k = 5
kf = KFold(n_splits=k, shuffle=True, random_state=42)

fold = 1
accuracy_per_fold = []

for train_index, val_index in kf.split(X):
    print(f"Training on fold {fold}/{k}...")

    # Split the data into training and validation sets
    X_train, X_val = X[train_index], X[val_index]
    y_train, y_val = y[train_index], y[val_index]

    # Build a new model for each fold
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=(18,)),  # Adjust input size (18 features)
        tf.keras.layers.Dense(10, activation='softmax')  # 10 possible diseases
    ])

    # Compile the model
    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])

    # Train the model on the training set and validate on the validation set
    history = model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=100, batch_size=32, verbose=0)

    # Evaluate the model on the validation set
    val_loss, val_accuracy = model.evaluate(X_val, y_val, verbose=0)
    print(f"Fold {fold} - Validation Accuracy: {val_accuracy:.4f}")
    accuracy_per_fold.append(val_accuracy)

    fold += 1

# Print the average accuracy across all folds
average_accuracy = np.mean(accuracy_per_fold)
print(f"Average Validation Accuracy across {k} folds: {average_accuracy:.4f}")

# Print the final training and validation accuracy for the current fold
train_accuracy = history.history['accuracy'][-1]
val_accuracy = history.history['val_accuracy'][-1]
print(f"Fold {fold} - Training Accuracy: {train_accuracy:.4f}, Validation Accuracy: {val_accuracy:.4f}")

# Evaluate the final model on the test set
test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=0)
print(f"Test Accuracy: {test_accuracy:.4f}")

# Save the final model trained on the entire dataset
model.save('disease_prediction_model_v4.h5')
print("Final model trained on all data and saved as disease_prediction_model_v4.h5")