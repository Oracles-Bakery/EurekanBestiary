# Eurekan Bestiary

A website to find out what monsters in FFXIV's Eureka instances spawn when, and what they drop, and when they mutate or
adapt.

## Updating Sources

Almost all structured information on the site is sourced from the Bestiary JSON file. They're manually updated and keep
in loose cadence with the bestiary sheet. I've made it fairly easy to update them manually without having to edit a
bunch of JSON manually - see the
`json-editor` subfolder for more information.

## Available Scripts

### npm start

Runs the app in the development mode. Open http://localhost:8080 to view it in the browser.

The page will reload if you make edits. You will also see any lint errors in the console.

### npm run build

Builds a static copy of your site to the `build/` folder.
