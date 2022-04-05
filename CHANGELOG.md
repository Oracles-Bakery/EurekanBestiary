# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The site always runs on the latest released version.

## Unreleased

## Changed

- The forecast page now uses a 4-column layout on larger screens.
- When sorting by changing monsters, it now prioritizes the ones that are currently changing.

## [2.1.0] - 2022-04-05

## Added

- Migrated the site to use [Halfmoon](https://gethalfmoon.com). This brings us a better
  design and dark mode support without me really having to do any extra work.
- Added a new "forecast" page that replaces the previous footer, allowing you to get a
  quick overview of the current and upcoming weather for all zones.
- Elements are now displayed alongside enemy names on the tracker page.
- Added a little intro that can be dismissed.

## Fixed

- Some enemies were showing "Mutates/Adapts in NaN" before, this was a bug and is fixed now.
- I _think_ I fixed a bug where it would sometimes show "Adapts 16 minutes ago" or something.
  This was related to how weather cycles work in this game, there's 3 cycles, from 8:00 to 16:00,
  16:00 to 0:00, and 0:00 to 8:00. Since day/night is from 8:00 to 18:00, the latter 2 weather cycles
  include both night time and day time, which my algorithm previously accounted for, but in a broken
  way. Hopefully, this works now.

## [2.0.1] - 2022-01-17

## Fixed

- Added a proper URL rewrite configuration.
- Renamed "augments" to "adapts" - that's the terminology used in game.

## [2.0.0] - 2022-01-17

## Added

- Redesigned the site.
- Monsters can now be filtered by a variety of factors.
- Added separate entry pages for every monster.
- Switched the JSON source from multiple files to one single file.
- Added a JSON editor for easy editing of the source file.

## [1.2.4] - 2021-12-22

## Added

- Added a banner that notifies users of the URL change, only shown when redirecting from the old URL.

## [1.2.3] - 2021-09-02

## Fixed

- Adjusted nighttime to start at 18:00 and end at 8:00 (some enemies just spawn later).

## [1.2.2] - 2021-09-01

## Fixed

- Mechanoguardian spawns at Blizzards during night.

## [1.2.1] - 2021-08-24

## Added

- Added a link to this changelog to the site.

## Fixed

- The "next weather change in" timer now updates every second. Previously it only updated every 10 seconds, which caused
  a weird bit of desync with the other site features.
- Similarly, the Eorzea Time clock now updates twice a second. Because Eorzean minutes are not exactly a second, this
  should hopefully cause the clock to not lag behind the in-game clock's intervals _too_ much.

## [1.2.0] - 2021-08-24

## Added

- Text describing monsters that was previously in brackets is now in little badge elements.

## Changed

- Nocturnal monsters (wraiths, ghosts, and so on) now correctly display as not spawning during daytime.
- The "matches" header has been changed to "mutates/augments".

## [1.1.1] - 2021-08-19

## Changed

- Changed the source URL.

## [1.1.0] - 2021-08-09

## Added

- Sprites now know about their spawn time, and will tell you if they're not spawning due to a missing weather condition.
- Sprites now also show the logogram they drop, give they drop any. This currently only works with Pyros sprites, I
  don't have enough data about Hydatos sprites at the moment.

## [1.0.1] - 2021-08-09

### Fixed

- Added level ranges for enemies in Hydatos that needed them.
- Fixed Mammet #013BL's name not being displayed correctly.
- Various condition changes for monsters.

## [1.0.0] - 2021-08-09

### Added

- Initial release.
