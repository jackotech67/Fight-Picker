# Fighter Picker

A full-stack web application for statistically inclined UFC fans.

🔗 **Live Site:** [Fighter Picker](https://fighter-picker.onrender.com)

## Features

- Browse upcoming and historical UFC events, including event cards and match ups
- Browse and filter UFC fighters through a dedicated fighter library
- Compare two fighters across general, career, and advanced statistics
- Highlight statistical advantages between fighters
- View individual fighter profiles, images and fight history
- Explore individual bouts and fighter performance statistics
- Import UFC event, fighter, bout, and fight statistics using the Cito API
- Store bout and round-level fight data for detailed fight analysis
- Secure admin authentication using JWT
- Add, edit, and delete fighter data through admin interface
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

A dedicated backend importer (`importCito.js`) supports importing both upcoming and historical UFC events using their event slugs. Imported data is stored in PostgreSQL, allowing the application to retrieve fighter and event information independently of the API.

The database supports events, bouts, fighter performances, and round-by-round statistics.

**Current historical coverage:** UFC 329 Holloway vs McGregor (10 July 2026) onwards.

## Deployment

- Frontend hosted on Render
- Backend API hosted on Render
- PostgreSQL database hosted on Neon

## Acknowledgements

Development support provided by [OpenAI ChatGPT](https://chatgpt.com/) — used throughout development for learning, debugging, and technical guidance.
