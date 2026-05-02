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

This project is in ***very early stage*** of development!
Do not expect anything to "work", other than scrolling the OSM map or the opened underlay image and demo of adding stations. 
Everything else is a little more than a placeholder now.
Also it's very ugly as I am focusing on functionality first, only styles necessary for the concept are somewhat refined. 
Treat it as a showcase of "work in progress", not a demo version of the app.
There was some thought put into the source code even if it is not utilized yet, so perhaps check that instead as it has hints of what's to come.
For example multiple language support is already figured out, even tho the user cannot set the language by himself yet.

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

### Once you are in
1. do not panic over no "design" whatsoever so far
2. check out the map creation, use the default OSM map or import map file (salzburg.jpg from frontend/public/other is quite a nice demo)
3. try to add some stations with right click and rename them
4. everything else is mostly a placeholder at this early stage