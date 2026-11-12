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

This project is in development!
Bugs and missing features are to be expected with this version of the prototype!

## Running the project

As of now, project completed transition to Cloudflare backend. 
Cloudflare was chosen as a unitary host for frontend, backend, project database and backgrounds database due to reliable and well documented solutions and generous free tiers well suited for a non-profit educational project that doesn't need too much scale (yet).

Currently the project is available on this public dev url for trying out:

https://tramap.bublavy3.workers.dev/

This is a hot deployment and is used for live testing during development!

Since direct import from Cloudflare is utilized (for headless browser that's used to take large screenshot for map export purposes), the project can't be run locally.
You can od course clone the project and look into the code, but to run it you would need to make your own Cloudflare deployment. 
Feel free to inspect the code and roam around the live website instead.


### Calendar of implementation
| Start date  | Issue                                                                        | State       |
|:------------|:-----------------------------------------------------------------------------|:------------|
| 15.2. 2026  | Libraries and frameworks selection                                           | In progress |
| 24.3. 2026  | Design and creation of the base project structure                            | Done        |
| 25.4. 2026  | Allow for language internationalization                                      | In progress |
| 26.4. 2026  | Implement universal map browsing engine                                      | Done        |
| 1.5. 2026   | Ensure placed graphic network elements are fixed relative to map coordinates | Done        |
| 2.5. 2026   | Implement station placement                                                  | Done        |
| 17.5. 2026  | Improve home page                                                            | In progress |
| 22.8. 2026  | Implement routes and junctions                                               | Done        |
| 22.9. 2026  | Implement simple line placement                                              | Done        |
| 25.9. 2026  | Implement line trunks with minimum crossings                                 | In progress |
| 8.10. 2026  | Implement timetable generation and linking of schedules                      | Done        |
| 12.10. 2026 | Database design and persistance                                              | Done        |
| 16.10. 2026 | Deploy the app to the public website                                         | In Progress |
| 29.10. 2026 | Implement pathfinding                                                        | Done        |
| 8.11. 2026  | Implement map export                                                         | Done        |



