const fs = require('fs');

// Define ranges for vital signs
const conditions = [
    'Common Cold', 'Influenza', 'COVID-19', 'Allergies', 'Bronchitis',
    'Pneumonia', 'Sinusitis', 'Gastroenteritis', 'Migraine', 'Dehydration'
];

// Define symptom patterns for each condition
const symptomPatterns = [
    [1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],  // Common Cold 
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],  // Influenza 
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],  // COVID-19 
    [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],  // Allergies 
    [0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],  // Bronchitis 
    [1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1],  // Pneumonia 
    [0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0],  // Sinusitis 
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],  // Gastroenteritis 
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],  // Migraine 
    [0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0]   // Dehydration
];

function getRandomInRange(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

function generateSymptoms(conditionIndex) {
    // Use the symptom pattern for the given condition index
    const baseSymptoms = symptomPatterns[conditionIndex];

    // Randomly flip some symptoms (introduce slight variability)
    return baseSymptoms.map(symptom => (Math.random() > 0.95 ? 1 - symptom : symptom));
}

function generateDataEntry() {
    const bodyTemperature = getRandomInRange(36.1, 40.0);
    const heart_rate = getRandomInRange(60, 140);
    const systolicBP = getRandomInRange(90, 140);
    const diastolicBP = getRandomInRange(60, 90);
    const respiratory_rate = getRandomInRange(12, 30);

    // Assign condition based on patterns
    let conditionIndex = Math.floor(Math.random() * conditions.length);
    let condition = conditions[conditionIndex];

    // Generate symptoms based on the condition
    const symptoms = generateSymptoms(conditionIndex);

    return {
        bodyTemperature,
        heartRate: heart_rate,
        systolic: systolicBP,
        diastolic: diastolicBP,
        respiratoryRate: respiratory_rate,
        symptoms,
        condition
    };
}

// Generate 500 entries
const dataset = [];
for (let i = 0; i < 500; i++) {
    dataset.push(generateDataEntry());
}

// Save to a JSON file
fs.writeFileSync('vital-signs.json', JSON.stringify(dataset, null, 2));
console.log('Dataset generated and saved to vital-signs.json');