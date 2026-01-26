<div align="center"">
  <img src="frontend/assets/easechaos.png" alt="easeCHAOS" width="100" height="100">
  <h1>easeCHAOS</h1>
</div>

## About

easeCHAOS is a modern, user-friendly timetable viewer designed specifically for UMaT students. Born out of the frustration of dealing with complex Excel spreadsheets and hard-to-read class schedules, this project aims to make viewing your class schedule as simple as possible.

### Why easeCHAOS?

- **Simplified View**: No more squinting at Excel sheets or searching through merged cells
- **Class-Specific**: View only your class's schedule, filtered and clean
- **Modern Interface**: Intuitive weekly and daily views
- **Mobile Friendly**: Access your schedule on any device
- **Download Options**: Download your schedule in pdf and image.

## Current Progress

The application currently features:
- ✅ Weekly view with all classes
- ✅ Daily detailed view
- ✅ Class filtering system
- ✅ Responsive design with Light and Dark Theme
- ✅ Calendar download (PDF & Image)
- ✅ Accessible as Progressive Web App (PWA). You can basically save for offline use once your schedule is loaded up

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Redis
- Docker (Optional, although preferred for local developement)

## Tech Stack

### Frontend
- React.js
- TailwindCSS
- TypeScript
- Vite

### Backend
- FastAPI (Python)
- Redis
- Docker

## Documentation

For detailed documentation, see the [docs/](./docs) folder:

- **[Data Extraction Documentation](./docs/data-extraction.md)** - Excel format requirements



### Installation (Local without Docker)
1. Clone the repository
2. Ensure you have `make` installed (available on most linux flavored systems)
3. Copy and rename `.env.sample` to `.env`
4. Run `make local` to start the application on local. However, before that, note that you would need a `redis` instance. You could create one on [upstash.com](https://upstash.com/) and just place the details in the `.env` file.


### Installation (Docker)

1. Clone the repository
2. Copy and rename `.env.sample` to `.env`
3. Run `make up` to start the application on docker.

NB: This project is still under development. You might encounter bugs with the processed data. However, issues stem from the drafts, and has nothing to do with the extractor in most cases. Refer to the IT department and respective class reps to resolve clashes and unfamiliar conventions.

### Current Progress

#### Light Theme
<img src="docs/screenshot2.jpeg" width="900">
<img src="docs/screenshot.jpeg" width="900">
<img src="docs/screenshot1.jpeg" width="900">

#### Dark Theme
<img src="docs/screenshot3.png" width="900">
<img src="docs/screenshot4.png" width="900">
<img src="docs/screenshot5.png" width="900">


## Contributors
- [@Aaron Ontonyin](https://github.com/Aaron-Ontoyin)
- [@Kekeli Dompeh](https://github.com/db-keli)
- [@Neil Ohene](https://github.com/0xDVC)

## Acknowledgements
- Mr. Edem Y. Broni
- Mr. Abdul-Aziz
- [@Kelvin Amoaba](https://github.com/kelvinamoaba)
