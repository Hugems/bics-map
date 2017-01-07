## Better mapping in Oracle BICS
bics-map is a JavaScript project that automates using the [Oracle Mapviewer v2 JSAPI](http://elocation.oracle.com/mapviewer/jslib/v2.1/apidoc/index.html) that is available in the [Oracle BICS](https://cloud.oracle.com/business_intelligence) environments. It leverages two technologies that BICS can use via Oracle Maps API:
1. WKT Data: ([Well Known Text format](https://en.wikipedia.org/wiki/Well-known_text)) for geographic locations within the BI dimensional tables
2. Map Tiles: remotely sourced mapping tiles from 3rd parties (currently [Carto](https://carto.com/) and [Stamen](http://maps.stamen.com/)) for static basemaps and dynamically styled tile maps.

## Core Capabilities
the bics-map libraies allow you to:
* show maps using 4 different background layers
* display BICS data as a heatmap from points
* display BICS data as point shapes by color and size
* display BICS data as polygons by color
* display BICS data as point clusters by color
* create dynamically rendered thematic maps from Carto
* create hyperlinks in the maps to do drill throughs (uses BICS PortalNav URLs)

## Why use bics-map?
The current [BICS](https://cloud.oracle.com/business_intelligence) offering provides basic out of the box mapping for cities, countries, states and similar basic boundary information. Most Business Intelligence and Analytic applications will require custom geographies and custom visualizations (such as heat maps) that arent available. The bics-map project provides a method for BICS customers to do both things. Also the current MapViewer HTML5 v2 API is feature rich and it is very laborious to use on a repeatable basis so the bics-map project tries to simplify usage to meet the needs of BICS users. _Basically I kept doing the same thing over and over again (poorly) in JS in BICS and I needed a way to automate and improve code and usage._

## Who should use bics-map?

## Caveats
There are couple of items that users of the code should understand:
1. this bics-map project was built using basic JS patterns and has not been thoroughly tested, _you will find bugs_
1. the bics-map code was developed for functional demonstrations and not production systems i.e. there are limits to how much data you can use and how you can visualize it.
2. I am a naive JS coder so you if you are Douglas Crockford or some other superstar dont b a hater
3. I plan on improving the library as time permits and adding tests - coding is not my full time job (see point above)


## Basic Usage
here are the basic steps to use the
### Using WKT

### Using Dynamic map tiles from Carto




## More Information
* [Deep dive presentation](http://download.oracle.com/otndocs/products/spatial/pdf/biwa_2015/biwa2015_html5_qian.pdf) on Mapviewer HTML5 v2 JSAPI by LJ Qian
