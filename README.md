# Adobe Illustrator Smart Export

### (aka SmartLayerExport)

This plugin is used to export Artboards/Layers/Symbols/Elements, these sources can be exported to multiple different formats (e.g. PNG, PDF, JPG, AI, etc).

Once you have set up export settings for a document, these settings can be saved in the document so that you don't need to redo them.

Export settings can also be saved as presets, which can be imported/exported for sharing.

***This plugin is no longer actively being maintained, please see below for contributing to the project.***

### Features:

- Ability to scale output files for HiDPI (Retina) displays, or any other scale factor.
- Can set up multiple export formats for a single file for easy regeneration of multiple asset sizes/types.
- Settings are saved within Illustrator file so that settings are remembered next time you open the panel.
- Layers can be trimmed down to the size of the layer itself or exported at the artboard's size.
- File name pattern allows for full flexibility of output file names.
- Can optionally export full Artboard images as well as individual layer images.
- Can Load/Save/Import/Export settings.
- Has a feature to 'Run Again' (CC only)

### Current Formats:

 - PNG 8
- PNG 24
- PDF
- JPG
- GIF
- EPS
- SVG
- SVGZ
- TIFF
- AI
- FXG (CS6 Only)

## Installation

- Select latest release from [releases page](https://github.com/TomByrne/IllustratorSmartExport/releases)
- Install with one of the following tools:
  - [ZXPInstaller](http://zxpinstaller.com/) (recommended)
  - Extension Manager (installed with Adobe applications)
  - [ExManCmd](https://www.adobeexchange.com/resources/28)

## Usage

**For CS version: ** Goto File > Scripts > Smart Layer Export

**For CC version:** Goto Window > Extensions > Smart Export

## Build process

At the moment, the build process is run locally, and it only works on Windows.

This is done by double-clicking `build/BuildAll.bat`.

There is the intention to migrate this to Travis CI at some point (but no resources).

The build process currently spits out different versions of the plugin installer based on the `Version_*` folders, to support multiple vendors with different settings (e.g. plugin name, plugin ID, features available). Also this will likely be removed if the build process is reworked.

The build process also generates two installers per `Version_*` folder, one for Illustrator CC, and one for Illustrator CS. The CC version gets installed in a slightly different way, which allows for multiple entry points.

## Contributing

To contribute to the plugin, please create an issue in the Github issue tracker above, so that it's clear what needs to be resolved/improved.

After making your changes in your own fork of the repo, create a Pull Request back into this repo named after the issue it intends to solve.

If the changes are accepted a new build/release will be created on the Releases page.