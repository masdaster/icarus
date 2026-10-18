<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/masdaster/icarus/raw/refs/heads/main/resources/images/title-dark.svg">
  <img alt="ICARUS Terminal" src="https://raw.githubusercontent.com/masdaster/icarus/refs/heads/main/resources/images/title.svg" height="100" width="auto"/>
</picture>

## About ICARUS Terminal

_ICARUS Terminal is a free, immersive, context-sensitive companion app and second screen interface for [Elite Dangerous](https://www.elitedangerous.com/)._

You can run ICARUS Terminal in a native window, on multiple windows/displays, as an overlayed window in top of the game if playing with a VR headset or on an ultra-wide display or connect remotely in a browser from another computer/tablet/phone/other devices (e.g. Chromebook, Android Phone/Tablet, Amazon Fire Tablet); the UI is specifically designed with touch screen devices in mind and to adapt the layout of panels to both landscape and portrait displays, both large and small.

<p align="center">&nbsp;</p>

<p align="center">
  <a href="https://github.com/iaincollins/icarus/releases">
    <img alt="Download" src="https://github.com/masdaster/icarus/raw/refs/heads/main/resources/images/download-button.svg" height="80" width="auto"/>
  </a>
</p>

## Screenshots

<img alt="System Map" src="https://github.com/masdaster/icarus/blob/main/resources/images/screenshots/nav-map.png" height="auto" width="98.5%"/>
<img alt="System List" src="https://github.com/masdaster/icarus/blob/main/resources/images/screenshots/nav-list.png" height="auto" width="49%"/> 
<img alt="Ship Status" src="https://github.com/masdaster/icarus/blob/main/resources/images/screenshots/ship-status.png" height="auto" width="49%"/>
<img alt="Blueprint" src="https://github.com/masdaster/icarus/blob/main/resources/images/screenshots/blueprint.png" height="auto" width="49%"/>
<img alt="Navigation Route" src="https://github.com/masdaster/icarus/blob/main/resources/images/screenshots/nav-route.png" height="auto" width="49%"/>

## Requirements

* Windows 10 or newer required.
* No dependencies are required to install the application.
* No manual configuration or setup is required, it will automatically find your game data.
* No additional disk space is required to store game data. Recent game data is loaded in to memory when launched and streamed in real time when the game is active, it is not persisted or cached to disk.

### Notes

* The launcher will indicate when a new release is available. Updating is optional.
* If you have a conflict with your anti-virus or firewall software, please contact the vendor responsible for that software.
* The application will run against the latest version of Elite Dangerous (Odyssey) and older releases (e.g. Horizons), but it is currently explicitly designed for use with the latest versions. Changes to the game API may impact functionality when using ICARUS Terminal with older versions of the game.
* The application includes a web interface to allow access from remote devices. The web interface is enabled by default while the application is running.

The web interface relies on advanced browser functionality for rendering and works best on native Google Chrome browsers (e.g. Google Chrome for Windows, Mac, ChromeOS, Android). Other browsers (e.g. Safari, Firefox, Chromium) may use fallback rendering and/or lack required features for full compatibility / optimal user experience.

## Developer Documentation
 
Code contributions, pull requests and bug reports are welcome. See [CONTRIB.md](CONTRIB.md) for more information. For developer documentation see [BUILD.md](BUILD.md).

### Developer Quickstart

If you are running on Linux and/or looking for quick instructions on how to run from source, if you have [Node.js](https://nodejs.org/en/) this is what you need to do to download and install  ICARUS Terminal:

    git clone git@github.com:iaincollins/icarus.git
    cd icarus
    npm install
    
Next, run `cp .env-example .env` to create an `.env` file and edit it to change the `LOG_DIR` option to point to the location of your Elite Dangerous log files:

    # LOG_DIR can be used to tell the Service where to look for game logs
    # This option can be used in development and at runtime
    LOG_DIR=path/to/logs

With that done, anytime you want to start ICARUS Terminal, all you need to do is run:

    npm start

This will run in debug mode which is not quite the same as a production build (it's not as optimized) but should work just fine.

## Legal

ICARUS Terminal is free, open-source software released under the ISC License.

ICARUS Terminal does not record Personally Identifiable Information (PII). ICARUS Terminal includes integrations with services like [EDSM](https://www.edsm.net), [EDDB](https://eddb.io/) and [INARA](https://inara.cz/). Data such as your current in-game location, cargo, etc. may be sent to them order to render information in the interface. ICARUS Terminal does not expose or send information about you or your in game character (e.g. your name, user name, commander name or ship name) but any requests made to a third party will include your IP address.

Elite Dangerous is copyright Frontier Developments plc. This software is not endorsed by nor reflects the views or opinions of Frontier Developments and no employee of Frontier Developments was involved in the making of it.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.

## Credits

_ICARUS Terminal would not be possible without work from dozens of enthusiasts and hundreds of open source contributors. See [CREDS.md](CREDS.md) for more information._

Special thanks to [Iain Collins](https://github.com/iaincollins) for building Icarus from scratch.

ICARUS Terminal uses imagery from/inspired by Elite Dangerous, which is copyright Frontier Developments plc. This software is not endorsed by nor reflects the views or opinions of Frontier Developments and no employee of Frontier Developments was involved in the making of it.

Thank you to all those who have created and supported libraries on which this software depends and to Frontier Developments plc for supporting third party tools.