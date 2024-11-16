<div align="center">
  <h1>easeCHAOS</h1>
</div>

## About

easeCHAOS is a modern, user-friendly timetable viewer designed specifically for UMaT students. Born out of the frustration of dealing with complex Excel spreadsheets and hard-to-read class schedules, this project aims to make viewing your class schedule as simple as possible.

### Why easeCHAOS?

- **Simplified View**: No more squinting at Excel sheets or searching through merged cells
- **Class-Specific**: View only your class's schedule, filtered and clean
- **Modern Interface**: Intuitive weekly and daily views
- **Mobile Friendly**: Access your schedule on any device
- **Export Options**: Download your schedule in Excel or iCalendar format

## Current Progress

The application currently features:
- ✅ Weekly view with all classes
- ✅ Daily detailed view
- ✅ Class filtering system (ui not done)
- ✅ Responsive design
- ✅ Calendar export functionality (ui not done)

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Redis

### Installation (Local without Docker)

1. Clone the repository
2. Ensure you have `make` installed
3. Copy and rename `.env.sample` to `.env`
4. Run `make local` to start the application on local. However, before that, note that you would need a `redis` instance. You could create one on [upstash.com](https://upstash.com/) and just place the details in the `.env` file.


### Installation (Docker)

1. Clone the repository
2. Copy and rename `.env.sample` to `.env`
3. Run `make up` to start the application on docker.

NB: This project is still under development.

### Current Progress

<img src="docs/screenshot.jpeg" width="800">
<img src="docs/screenshot1.jpeg" width="800">

## Contributors

- [@Aaron Ontonyin](https://github.com/Aaron-Ontoyin)
- [@Kekeli Dompeh](https://github.com/db-keli)
- [@Neil Ohene](https://github.com/0xDVC)
