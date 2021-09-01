# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The site always runs on the latest released version.

## [Unreleased]

## [1.2.2] - 2021-09-01

## Fixed

- Mechanoguardian spawns at Blizzards during night.

## [1.2.1] - 2021-08-24

## Added

- Added a link to this changelog to the site.

## Fixed

- The "next weather change in" timer now updates every second. Previously it only updated every
  10 seconds, which caused a weird bit of desync with the other site features.
- Similarly, the Eorzea Time clock now updates twice a second. Because Eorzean minutes are not
  exactly a second, this should hopefully cause the clock to not lag behind the in-game clock's
  intervals _too_ much.

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

- Sprites now know about their spawn time, and will tell you if they're not
  spawning due to a missing weather condition.
- Sprites now also show the logogram they drop, give they drop any. This
  currently only works with Pyros sprites, I don't have enough data about
  Hydatos sprites at the moment.

## [1.0.1] - 2021-08-09

### Fixed

- Added level ranges for enemies in Hydatos that needed them.
- Fixed Mammet #013BL's name not being displayed correctly.
- Various condition changes for monsters.

## [1.0.0] - 2021-08-09

### Added

- Initial release.
