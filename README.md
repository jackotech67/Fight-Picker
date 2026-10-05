# Fighter Picker

A full-stack web application for comparing UFC fighters, browsing UFC events, and exploring fighter statistics and fight history.

🔗 **Live Site:** [Fighter Picker](https://fighter-picker.onrender.com)

## Features

- Browse and filter UFC fighters through a dedicated fighter library
- Compare two fighters across general, career, and advanced statistics
- Highlight statistical advantages between fighters
- View individual fighter profiles and fight history
- Import UFC event, fighter, bout, and fight statistics using the Cito API
- Store bout and round-level fight data for detailed fight analysis
- Secure admin authentication using JWT
- Add, edit, and delete fighter data through the admin interface
- Persistent fighter, event, bout, and performance data stored in PostgreSQL
- Responsive user interface

## Technologies

### Frontend
- React
- JavaScript
- CSS
- Vite

### Backend
- Node.js
- Express
- REST API
- JWT Authentication
- bcrypt

### Data
- PostgreSQL
- Cito API

## Data Integration

Fighter Picker integrates with the Cito API to retrieve UFC fighter, event, bout, and statistical data.

Backend import tools are used to populate and update the PostgreSQL database while retaining local control over the application's data. The database supports events, bouts, fighter performances, and round-by-round statistics.

## Deployment

- Frontend hosted on Render
- Backend API hosted on Render
- PostgreSQL database hosted on Neon

## Acknowledgements

Development support provided by [OpenAI ChatGPT](https://chatgpt.com/) — used throughout development for learning, debugging, and technical guidance.
