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

## Prototype's user guide

### Creator (transit agency)
- To create transit map click "Create transit map" button.
- You get redirected to new, empty project based on OpenStreetMap. You can also select Image underlay and upload your background image (like map of your city).
- You can load existing project with load button and search. You can also save your project with an option to select country (or countries for cross-border systems) under which it will be listed.
- Interaction with the project (transit map) is done via displayed map and via Editor panel with tabs.
- Transit network you can create has following structure (with an obvious, so far theoretical mapping to GTFS format):
  * Stations represent stations and stops in the transit network. In current version all physical stop locations of a station/stop acting under one name like "Town Hall" or "Alexander Square" are intended to be represented by one station geographically placed at the most representative position.
  * Routes connect the stations. Each route represent real path transit vehicle takes between 2 stations (or junctions, see bellow). Where stations are not connected by one simple straight line (like a long straight street or metro tunnel), routes are intended to consist of multiple straight segments to represent this real path. The accuraccy of copying a physical path is up to the user.
  * Junctions are objects that for routes act like stations, so that routes can split without station required at the splitting point. For example in an letter Y shaped layout, the middle point tha would be on real crossroad is intended to be represented by junction, and all 3 legs of the letter are supposed to be separate routes. In Routes tab junctions are automatically named according to their coordinates.
  * Lines operate on routes. Multiple lines can share the same route. They represent real public transit lines, most often denoted with numbers/letters like "32" or "T3", run by one type of vehicle (bus, tram, metro, ferry...), coloquially referenced as "Bus 32" or "Tram T3" by passengers. Lines can branch, but as in real world, they must be continuous. Loops on lines are not yet tested and would probably lead to bugs.
  * Directions are actual paths from departure station to terminus station that transit vehicles take on the lines. Each line has its own directions, that are specified by user. Line without branches usually has 2 directions, one in each... direction (hence the name). Line that branches once, like letter Y, usually has 4 directions, for obvious reasons, and so forth. Directions do store ordered paths of routes they take.
  * Sequences are sequences of departure times on a direction. Each direction can have multiple sequences which are automatically combined in direction's timetable for passenger purposes. Directions can have multiple sequences because the interval of departures often varies across the day to adjust to passenger demand.
  * Traffic levels are degrees of traffic congestion that vehicles on the line are expected to get through. They are set per each half an hour. They are set per line, as different lines can be affected by traffic differently (buses running through city centre, buses running on peripheral roads, metro...). The app recongizes standard, high and low traffic times (high usually corresponds to busy hours when streets are packed with cars traveling to or from work, low usually corresponds to night time). Each route can have duration set in each of the 3 traffic levels. That duration represents how long it takes for vehicles to cross that route (realistically speed of vehicles on one specific route is roughly the same in public transit networks, trains or metro do operate on their own routes usually). If only standard duration is set for the route, line assumes this duration regardless of whether it runs during its busy/quiet hours.
- Described structure is created via tabs in Editor panel. These have their own descriptions as of now.
- Typical workflow for creation of a new transit network map:
  1. Locate your area on the OpenStreetMap or open the background image for it.
  2. Place stations using Stations tab and rename them in the tab.
  3. Open Routes tab and place routes between stations. Utilize junctions for routes splitting outside stations.
  4. Set durations for routes representing expected time it takes to cross that route for vehicles that use it. You can enable and set durations in high or low traffic separatelly.
  5. Open Lines tab and add lines. Select line to add routes to it using the map as described in tab's description. Set line's name, transit mode and color.
  6. Open line's timetable with its timetable button. If there are no directions yet, direction editor is displayed first (if there are directions and you want to add more, select "Add new direction" option in the Direction select).
  7. If line is subject to various traffic levels, you can set them per half an hour using the colored bar at the top.
  8. Set start station and end station. You can select passthrough stations if you want to specify a detour to other branch, otherwise leave it empty and the algorithm automatically finds the direction's path along the line's routes.
  9. For sequence set first departure time in the day when vehicle departs from start station. Set interval to specify how often it departs. Set last departure time limit to make algorithm not generate departure times after this one. Add sequence. As mentioned before, all sequences sharing a connection are merged in the timetable printout.
  10. You can check the generated timetable for direction you created in the Direction select.
  11. You can go to Station tab and by clicking station's timetable button see visualization of upcoming trips going to every direction passing the station.
  12. You can go to Map tab and export the map. If it uses OpenStreetMap underlay, symbol size is set automatically. If you used image underlay, you can set symbol size yourself, as the app doesn't know the details size of the image you used. You can export as image or as pdf. Export starts a browser download after data is ready (usually within seconds or dozens of seconds).
  13. As already mentioned, you can save your project and it will be available for viewing and editing in the future.
 
### Viewer (passenger)
- Search existing project in the home screen by project name or country name, or select it after finding your country in menubar.
- In the viewer mode you cannot edit the project.
- You can view stations and lines on map and in tabs.
- You can see timetables for directions and upcoming trip overviews for stations (if set up).
- You can use quickest journey search in Journey tab. This also only works if lines have set up directions and sequences, otherwise there is no data to base useful trip search on.

### Important notes
- There is no user management implemented yet, so everyone can edit and see anything. This will of course not be the case in future.
- CSS styles and display in other viewport sizes were not refined yet. This is also planned for the future.
- Many edge cases are not treated yet. Testing and refining phase is planned for the future.
- Almost all available projects are debugging ones, some of them have corrupted data that no longer matches expectations of algorithms added later.

## Calendar of implementation
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



