# Eureka Marks

A website to find out what monsters in FFXIV's Eureka instances
spawn when, and what they drop, and when they mutate or augment.

## Updating Sources

Almost all structured information on the site is sourced from the
Bestiary JSON files. These are initially converted from an auto-exported
CSV file, sourced from a copy of the official Eurekan Bestiary document
that I changed so that its CSV export is machine-readable ([link](https://docs.google.com/spreadsheets/d/1f22zAQuSEWysOMB-yzUk-WZe0FdKk8S34-xlDT1qRyk/edit?usp=sharing)).

If you want to change anything, it's best to send a patch that edits
the `src/[zone].bestiary.json` files. Regenerating those files via
the included script would undo many manual formatting and content edits.

## Available Scripts

### npm start

Runs the app in the development mode.
Open http://localhost:8080 to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### npm run build

Builds a static copy of your site to the `build/` folder.
