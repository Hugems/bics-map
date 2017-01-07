/**
 * module that parses WKT data and develops an OM Vector layer based on settings and params
 * @param {Object} markerOptions - object literal of settings for the marker
 * @param {Object} labelOptions - object literal of settings for the label in the marker
 * @param {Object} bindOptions - object literal of settings for column and symbology binding
 * @returns {BIOM.Map}
 */
BIOM.Map = (function() {

    // private variables
    var baseLayer, omap, Constr;
    var srid = 8307;

    var baseURL = '/mapviewer';

    Constr = function(mapDivName, mapOptions, baseOptions, layerData) {
        //console.log("Init map on this div:" + mapDivName);

        //map options
        var defaultMapOptions = {
            lat: 36,
            lng: -115,
            zoom: 7
        };
        var mapSettings = $.extend({}, defaultMapOptions, mapOptions || {});

        //basemap options
        var defaultBaseOptions = {
            baseid: 0,
            opacity: 0.75
        };
        var baseSettings = $.extend({}, defaultBaseOptions, baseOptions || {});

        omap = new OM.Map(document.getElementById(mapDivName), {
            mapviewerURL: baseURL
        });

        //add basemap
        this.setBasemap(baseSettings.baseid, {
            opacity: baseSettings.opacity
        });

        //add zoom buttons
        var navigationPanelBar = new OM.control.NavigationPanelBar({
            style: 3
        });
        omap.addMapDecoration(navigationPanelBar);
        var center = new OM.geometry.Point(mapSettings.lng, mapSettings.lat, srid);

        //start map
        omap.setMapCenter(center);
        omap.setMapZoomLevel(mapSettings.zoom);
        omap.init();
    };

    // public API – prototype
    Constr.prototype = {
        constructor: BIOM.Map,
        setBasemap: function(id, options) {
            var defaultOptions = {
                opacity: 0.5,
                baseid: 1
            };
            var settings = $.extend({}, defaultOptions, options || {});
            //get the enumeration to get the basemap details
            var lid = (BIOM.baseLayerEnum.properties.hasOwnProperty(id)) ? id : settings.baseid;
            var baseMapProps = BIOM.baseLayerEnum.properties[lid];

            //define base tiles from enum
            baseLayer = new OM.layer.OSMTileLayer("baseMap", baseMapProps.tiles, baseMapProps.format);
            baseLayer.setOpacity(settings.opacity);

            //setup attribution
            var copyright = new OM.control.CopyRight({
                anchorPosition: 6,
                textValue: baseMapProps.attr,
                fontSize: 8,
                fontFamily: "Arial",
                fontColor: "#aaaaaa"
            });
            omap.addMapDecoration(copyright);

            //add to map
            omap.addLayer(baseLayer);
        },
        getMap: function() {
            return omap;
        },
        addLayer: function(biomLayer) {
            omap.addLayer(biomLayer.getLayer());
        }
    };

    return Constr;

})();
