# Healthcare Monitoring System

A web application for nurse practitioners to monitor patients during the first weeks of their release from the hospital and help patients monitor their daily activities.

## Features

### User Registration/Login
- Register as a nurse or patient
- Secure authentication with JWT

### Nurse Features
- Enter vital signs for patients
- Access information from previous clinical visits
- Send daily motivational tips to patients
- Generate a list of possible medical conditions using AI

### Patient Features
- Create and send emergency alerts
- Enter daily health information
- Use a checklist of common signs and symptoms

## Technologies Used

### Backend
- Node.js with Express
- GraphQL API
- MongoDB for data storage
- JWT for authentication

### Frontend
- React 18 with functional components
- React Router for navigation
- Apollo Client for GraphQL integration
- React Bootstrap for UI components

### AI Microservice
- Flask API

## Project Structure

```
Grp2COMP308Project/
├── src/
│   ├── ai-microservices/    # AI microservice for symptom analysis
│   ├── backend/             # Express GraphQL API
│   │   ├── models/          # MongoDB models
│   │   ├── middleware/      # Authentication middleware
│   │   └── schema/          # GraphQL schema
│   └── frontend/            # React frontend
│       ├── public/          # Static files
│       └── src/             # React components
│           ├── components/  # Shared components
│           ├── context/     # Context providers
│           └── pages/       # Page components
├── docs/                    # Documentation
└── tests/                   # Tests
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Python 3.8+ (for AI microservice)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/Grp2COMP308Project.git
   cd Grp2COMP308Project
   ```

2. Install backend dependencies
   ```
   cd src/backend
   npm install
   ```

3. Install frontend dependencies
   ```
   cd ../frontend
   npm install
   ```

4. Install AI microservice dependencies
   ```
   cd ../ai-microservices
   pip install flask flask-cors
   ```

   Note: If you encounter issues with the requirements.txt file, you can install the packages directly as shown above.

5. Configure environment variables
   - Create a `.env` file in the `backend` directory with your MongoDB connection string and JWT secret

### Running the Application

1. Open terminal window and run the following command:

   .\start-app.bat

2. OR follow below method:

1. Start the backend server
   ```
   cd src/backend
   npm run dev
   ```

2. Start the frontend development server
   ```
   cd src/frontend
   npm start
   ```

3. Start the AI microservice
   ```
   cd src/ai-microservices
   python app.py
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Contributors

- [Team Member 1](https://github.com/alelimc)
- [Team Member 2](https://github.com/ntsn301)
- [Team Member 3](https://github.com/mtoleran35)
- [Team Member 4](https://github.com/jbelenzo)
- [Team Member 5](https://github.com/ArtBobr)
