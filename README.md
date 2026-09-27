# Web application for creating and viewing interactive maps of public transport

Welcome to the official GitHub page of the diploma thesis project by Ondrej Bublavý at Comenius University, Faculty of Mathematics Physics and Informatics. 
Here you will find:
- the source code you can clone and run
- information about the state of development
- all the documentation (mostly in the future)
- PDF of the most recent version of the thesis
- relevant studied literature

## Where to look for thesis, studied articles and seminar presentation...
- current version of the PDF thesis is directly in `thesis` directory
- studied literature is in `thesis/literature`
- presentation for project seminar is directly in `docs`

## State of development

This project is in ***early stage*** of development!
Basis for the concepts of map utilization, stations, lines, routes and route junctions are now implemented but are not polished, 
mostly serve as mock, and will keep receiving new functionality and functionality updates. 
Bugs and missing features are to be expected with this version of the prototype!

## Running the project

### Preconditions
If you are running the project for the first time:
1. clone this repo
2. run: `npm install` in both backend and frontend directory

### Backend
1. in `backend` directory run: `node server.js`

### Frontend
1. in `frontend` directory run: `npm run dev`
2. proceed to the provided URL

### Calendar of implementation
| Start date | Issue                                                                        | State       |
|:-----------|:-----------------------------------------------------------------------------|:------------|
| 15.2. 2026 | Libraries and frameworks selection                                           | In progress |
| 24.3. 2026 | Design and creation of the base project structure                            | Done        |
| 25.4. 2026 | Allow for language internationalization                                      | In progress |
| 26.4. 2026 | Implement universal map browsing engine                                      | Done        |
| 1.5. 2026  | Ensure placed graphic network elements are fixed relative to map coordinates | Done        |
| 2.5. 2026  | Implement station placement                                                  | Done        |
| 17.5. 2026 | Improve home page                                                            | In progress |
| 22.8. 2026 | Implement routes and junctions                                               | In progress |
| 22.9. 2026 | Implement simple line placement                                              | Done        |
| 25.9. 2026 | Improve line trunks with minimum crossings                                   | In progress |
