/**
 * module extension of OM.TileLayer for Cartodb
 * creates a parameterized tile layer using carto Tile Map APIs
 * @param {String} name - layername for internal map management
 * @param {Object[]} dataAry - array of OM.Feature
 * @param {Object} configBinding - object literal of settings for column and symbology bindnig
 * @param {Object} cartoOptions - object literal of core carto settings like format, apiKey etc
 * @returns {BIOM.Marker}
 */
// example tilereq: “https://{username}.carto.com/api/v1/map/named/{template_id}/{layer}/{z}/{x}/{y}.png”
OM.layer.CDBTileLayer = OM.layer.TileLayer.extend({
    //object of settings for carto XYZ API
    cartoSettings: {},
    //object of directives for carto template
    cartoConfig: {},
    //string of directives for carto template
    cartoConfigStr: "",
    //define layerName, DataArray, Bindings, cartoDBOptions
    initialize: function initialize(name, dataAry, configBinding, cartoOptions) {

        //common Carto options
        var defaultCartoOptions = {
            https: true,
            layerid: "all",
            template: "",
            format: "png",
            pre: "color_",
            user: "cmhughes",
            api: "c16a0bee443454b008a9479c938f6904b773ff80",
            opacity: 0.5,
            placeholder: {
                label_size: 0,
                line_opacity: 0.75,
                test: "boo!"
            }
        };
        cartoSettings = $.extend({}, defaultCartoOptions, cartoOptions || {});

        //set the config object and string
        this.setCartoConfig(cartoSettings.pre, dataAry, configBinding, cartoSettings.placeholder);

        initialize.base.call(this, name, {
            //uses same config as OSM
            tileLayerConfig: OM.layer.TileLayerConfig.CONFIG_OSM,
            getTileURL: function(level, tileX, tileY, bound) {
                var configBound = this.tileLayerConfig.bounds;
                var tileImageHeight = this.tileLayerConfig.tileImageHeight;
                var zoomLevelConfig = this.tileLayerConfig.zoomLevels[level];
                var y = (configBound.getMaxY() - bound.getMaxY()) / zoomLevelConfig.resolution / tileImageHeight;

                var isHttps = cartoSettings.https;
                var layerId = cartoSettings.layerid;
                var imageFormat = cartoSettings.format;
                var templ = cartoSettings.template;

                //build root URL
                var requestUrl = null;
                requestUrl = (isHttps) ? "https://" : "http://";
                requestUrl = requestUrl + cartoSettings.user + ".carto.com/api/v1/map/named/" + templ + "/" +
                    layerId + "/" + level + "/" + tileX + "/" + y + "." + imageFormat;

                //develop URL params
                var vendorParams = {
                    apikey: cartoSettings.api
                };
                if (OM.notNull(this.cartoConfigStr)) {
                    vendorParams["config"] = this.cartoConfigStr;
                }

                //add params to string
                if (OM.notNull(vendorParams)) {
                    var prefix = "?";
                    for (var p in vendorParams) {
                        if (vendorParams.hasOwnProperty(p)) {
                            requestUrl = requestUrl + prefix + p + "=" + vendorParams[p];
                            prefix = "&";
                        }
                    }
                }

                return requestUrl;
            }
        });
        //set the Layer opacity
        this.setOpacity(cartoSettings.opacity);
    },
    getCartoConfig: function() {
        return this.cartoConfig;
    },
    /**
     * Property setter for the carto config object and carto config string
     * The carto config object supplies runtime parameters for the Carto tile requests
     * @param {String} prefix - the prefix for the placeholder usually "color_"
     * @param {Object[]} featureArray - array of OM.Feature
     * @param {Object} binding - object defines the color placeholders based on feature values
     * @param {Object} addOptions - base single placeholders such as line opacity.
     * @returns void
     */
    setCartoConfig: function(prefix, featureArray, binding, addOptions) {
        /**
         * TODO reuse binding from WKT Layer - create new module
         */
        var cbRamp = (OM.style.colorbrewer[binding.ramp]) ? OM.style.colorbrewer[binding.ramp][binding.steps] : OM.style.colorbrewer.OrRd[binding.steps];

        var colorFormatter = new OM.style.ColorFormatter({
            colors: cbRamp, //a 7-color series from colorbrewer
            scale: binding.scale //map the colors to the values using a logarithmic scale or
        });

        var measureColumn = new OM.Column({
            data: featureArray, //an array of <key, value> pairs
            keyGetter: function() {
                return this.attributes[binding.idcol];
            }, //'this' here always refers to an element of the data array.
            valueGetter: function() {
                return this.attributes[binding.valcol];
            }
        });
        //create base cfg object from addOptions params
        var cfg = addOptions;

        //add the style params / placehiolders for carto config parameter
        $.each(featureArray, function(idx, feat) {
            var val = colorFormatter.resolve(feat.attributes[binding.valcol], measureColumn, feat);
            var key = prefix + feat.attributes[binding.idcol];
            cfg[key] = val;
        });
        //set the class property to the enriched config object
        this.cartoConfig = cfg;

        //flatten params to URL encoded strings
        this.cartoConfigStr = this.getCartoConfigStr(cfg);
    },
    /**
     *@param {Object}  Creates a URL string representation of the carto
     *                 config object for passing params for placeholders in the request URL
     *                 eg '...api/v1/map/named/world_borders/all/0/0/0.png?config={color_AK:"fuschia", color_AL:"crimson"}'
     *                 see https://carto.com/docs/carto-engine/maps-api/named-maps/#placeholder-types
     *                 for more info on carto placeholders
     *@returns {String}
     */
    //generate this: '{"color_NCA":"green", "color_AFA":"red"}'
    getCartoConfigStr: function(configObject) {

        var configParam = "";
        var params = [];
        for (var p in configObject) {
            if (configObject.hasOwnProperty(p)) {
                var pair = '"' + p + '":';
                if (typeof configObject[p] == "string") {
                    pair = pair + '"' + configObject[p] + '"';
                } else {
                    pair = pair + configObject[p];
                }
                params.push(pair);
            }
        }
        configParam = "{" + params.join(",") + "}";

        return encodeURIComponent(configParam);
    }
});
