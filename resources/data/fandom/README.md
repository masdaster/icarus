# README

This includes material from the Elite Dangerous wiki at Fandom and is licensed under the Creative Commons Attribution-Share Alike License.

* https://elite-dangerous.fandom.com
* https://www.fandom.com/licensing

The purpose of exporting this data is to be able to provide additional information inside ICARUS Terminal, such as context sensitive information about modules, equipment, items, factions, etc and to provide a glossary/codex.

This will be done with appropriate licensing information and credits / backlinks.

## Exporting Data via API

This can be exported using the API via REST queries:

https://elite-dangerous.fandom.com/api.php?action=query&list=allpages&aplimit=500&export=true&format=json

## Data Dump via API

The Save The Web Team have writen a python tool to help with exporting data in bulk:

https://github.com/saveweb/wikiteam3

To use this tool you will need to have Python v3 installed and install with pip:

    pip install wikiteam3

This is an example how to use this tool:

    
    wikiteam3dumpgenerator https://elite-dangerous.fandom.com --xml --curonly --images --delay=1

This will generate an XML dump of the site.

The text on this wiki is released under Creative Commons Attribution-Share Alike License.