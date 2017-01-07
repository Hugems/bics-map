// create the root namespace and making sure we're not overwriting it
var BIOM = BIOM || {};

/**
 * enumeration of layer types which are used in BIOM.WktLayer
 */
BIOM.layerTypeEnum = {
    POINT: 0,
    POINT_CLUSTER: 1,
    POINT_HEATMAP: 2,
    LINE: 3,
    POLYGON: 4,
    properties: {
        0: {id: 0, name: "point",
            selectStyle: new OM.style.Color({strokeThickness: 1, outlineStroke: "gold", outlineStrokeThickness: 2.0})
        },
        1: {id: 1, name: "point-cluster",
            selectStyle: new OM.style.Color({strokeThickness: 1, outlineStroke: "gold", outlineStrokeThickness: 2.0})
        },
        2: {id: 2, name: "point-heatmap",
            selectStyle: ""
        },
        3: {id: 3, name: "line",
            selectStyle: ""
        },
        4: {id: 4, name: "polygon",
            selectStyle: new OM.style.Color({strokeThickness: 1, outlineStroke: "gold", outlineStrokeThickness: 2.0})
        }
    }
};


/**
 * enumeration of binding types
 */
BIOM.bindingTypeEnum = {
    NONE: 0, //no binding
    SIZE: 1, //1 binding on size
    COLOR: 2, //1 binding on color
    SIZE_COLOR: 3, //2 bindings on size and color
    LINE_WEIGHT: 4, //1 binding on lineweight - not implemented yet
    properties: {
        0: {type: "no binding"},
        1: {type: "vary size"},
        2: {type: "vary color"},
        3: {type: "vary size and color"},
        4: {type: "vary line weight"}
    }
};


/**
 * enumeration of annotation/attribution
 */
BIOM.annoEnum = {
    stamen: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
        'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ' +
        'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
    carto: 'Map tiles &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a>'
};

/**
 * enumeration of base map types leveraging OM.OSMTileLayer
 */
BIOM.baseLayerEnum = {
    ST_TERRAIN: 0,
    ST_TONER: 1,
    CDB_GRAY: 2,
    CDB_DARK: 3,
    properties: {
        0: {
            id: 0,
            name: "Terrain",
            filetype: "jpg",
            type: "Stamen",
            attr: BIOM.annoEnum.stamen,
            tiles: ["https://stamen-tiles-a.a.ssl.fastly.net/terrain", "https://stamen-tiles-b.a.ssl.fastly.net/terrain",
                "https://stamen-tiles-c.a.ssl.fastly.net/terrain", "https://stamen-tiles-d.a.ssl.fastly.net/terrain"
            ]
        },
        1: {
            id: 1,
            name: "Toner Lite",
            filetype: "png",
            type: "Stamen",
            attr: BIOM.annoEnum.stamen,
            tiles: ["https://stamen-tiles-a.a.ssl.fastly.net/toner-lite", "https://stamen-tiles-b.a.ssl.fastly.net/toner-lite",
                "https://stamen-tiles-c.a.ssl.fastly.net/toner-lite", "https://stamen-tiles-d.a.ssl.fastly.net/toner-lite"
            ]
        },
        2: {
            id: 2,
            name: "Simple",
            filetype: "png",
            type: "Carto",
            attr: BIOM.annoEnum.carto,
            tiles: ["https://cartodb-basemaps-a.global.ssl.fastly.net/light_all", "https://cartodb-basemaps-b.global.ssl.fastly.net/light_all",
                "https://cartodb-basemaps-c.global.ssl.fastly.net/light_all", "https://cartodb-basemaps-d.global.ssl.fastly.net/light_all"
            ]
        },
        3: {
            id: 3,
            name: "Dark",
            filetype: "png",
            type: "Carto",
            attr: BIOM.annoEnum.carto,
            tiles: ["https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all", "https://cartodb-basemaps-b.global.ssl.fastly.net/dark_all",
                "https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all", "https://cartodb-basemaps-d.global.ssl.fastly.net/dark_all"
            ]
        }
    }
};

/**
 * enumeration of marker shape types which are used in BIOM.Style
 */
BIOM.pointShapeEnum = {
    CIRCLE: 0,
    SQUARE: 1,
    DIAMOND: 2,
    TRIANGLE: 3,
    STAR: 4,
    HEXAGON: 5,
    properties: {
        0: { type: "circle", cx: 0, cy: 0, width: 15, height: 15 },
        1: { type: "rectangle", width: 15, height: 15 },
        2: { type: "path", coords: [ [0, 0, 15, 15, 0, 30, -15, 15] ] },
        3: { type: "path", coords: [ [-5, -5, 5, -5, 0, 20] ] },
        4: { type: "path", coords: [ [350,75,379,161,469,161,397,215,423,301,350,250,277,301,303,215,,231,161,321,161] ] },
        5: { type: "path", coords: [ [850,75,958,137.5,958,262.5,850,325,742,262.6,742,137.5] ] }
    }
};
