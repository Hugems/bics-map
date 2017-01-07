/**
* module that parses WKT data and develops an OM Vector layer based on settings and params
* @param {String} layerName - the name of the layer
* @param {OM.Map} oMap - reference to the OM map
* @param {Object[]} dataAry - array of WKT features using the format of:
		{id:"@1", wkt:"@2", attributes:{id: "@1", ..., ..., }, label:"@1"}
* @param {Object} layerOptions - object literal of settings for the layer
* @param {Object} styleOptions - object literal of settings for the style of the layer
* @returns {BIOM.WktLayer}
*/
BIOM.WktLayer = (function() {

    // private variables
    var myLayer, layerType, bindType, features, bindData, infoPopup, Constr, oracleMap;
    var myStyle, labelStyle, hoverStyle, selectStyle;

    var shadow = new OM.visualfilter.DropShadow({
        opacity: 0.5,
        color: "#000000",
        offset: 6,
        radius: 10
    });

    Constr = function(layerName, oMap, dataAry, layerOptions, styleOptions, drillOptions) {
        //styleOptions:{ marker:{}, shape:{}, label:{}, cluster:{}, heat:{}, bind:{type:0, size:{}, color:{}} }
        //layerOptions:{ type:0, zoom:false, shadow:true, drill:true, opacity:0.5}
        //drillOptions:{ drill: false, key: "ID", baseUrl: "/analytics/saw.dll?Dashboard", params:{see below} };

        oracleMap = oMap;

        //layer settings - type is enumerated above
        var defaultLayerOptions = {
            type: 0,
            zoom: false,
            shadow: true,
            drill: false,
            opacity: 0.75
        };
        var layerSettings = $.extend({}, defaultLayerOptions, layerOptions || {});
        layerType = layerSettings.type;

        console.log("Building a BIOM Layer " + BIOM.layerTypeEnum.properties[layerType].name + " - named:" + layerName);

        //style settings template
        var defaultStyleOptions = {
            marker: {},
            shape: {},
            label: {
                color: "white",
                size: 12,
                name: "Helvetica",
                source: "COUNT"
            },
            heat: {
                source: "COUNT"
            },
            cluster: {
                start: 20,
                steps: 5,
                increment: 10,
                mincount: 1,
                threshold: 40,
                class: "equal"
            },
            bind: {
                type: 0,
                size: {},
                color: {}
            }
        };
        var styleSettings = $.extend({}, defaultStyleOptions, styleOptions || {});

        //drill settings - type is enumerated above
        var defaultDrillOptions = {
            drill: true,
            key: "ID",
            baseUrl: "/analytics/saw.dll?Dashboard",
            params: {
                PortalPath: "%2Fcompany_shared%2FDIRECTORY%20NAME%2F_portal%2FDASHBOARD%20NAME",
                page: "PAGE%20NAME",
                action: "Navigate",
                op1: "eq",
                col1: '"DIM_TABLE"."DIM_COLUMN"'
            }
        };

        var drillSettings = $.extend({}, defaultDrillOptions, drillOptions || {});
        //create info popup
        //todo: move to map
        //calculate pixel heignt based on num of columns
        var puHeight = Object.keys(dataAry[0].attributes).length * 27;
        infoPopup = new BIOM.InfoWin({
            h: puHeight
        }, drillSettings);

        //define binding type if not provided then set to 0 = none
        //get a simple array for binding
        //force binding types per layertype
        if (layerType == BIOM.layerTypeEnum.POINT_HEATMAP) {
            bindType = 0;
            styleSettings.bind.type = 0;
        } else {
            bindType = ('type' in styleSettings.bind) ? styleSettings.bind.type : 0;
        }
        console.log("Binding the BIOM Layer using " + BIOM.bindingTypeEnum.properties[bindType].type);

        //parse data array into OM features
        features = BIOM.parser.parseData(dataAry);

        //get BIOM.Style and OM styles
        var biomStyle = new BIOM.Style(layerType, styleSettings, features);
        myStyle = biomStyle.getStyle();
        hoverStyle = biomStyle.getHoverStyle();
        selectStyle = biomStyle.getSelectStyle();
        labelStyle = biomStyle.getLabelStyle();

        //setup different OM layers by type
        if (layerType <= 1) {
            // BIOM.layerTypeEnum.POINT and BIOM.layerTypeEnum.POINT_CLUSTER
            myLayer = new OM.layer.MarkerLayer(layerName, {
                def: {
                    type: OM.layer.VectorLayer.TYPE_LOCAL
                }
            });
        } else if (layerType == 2) {
            // BIOM.layerTypeEnum.POINT_HEATMAP
            myLayer = new OM.layer.VectorLayer(layerName, {
                def: {
                    type: OM.layer.VectorLayer.TYPE_LOCAL
                },
                styleAttribute: [styleSettings.heat.source]
            });
        } else {
            // BIOM.layerTypeEnum.LINE,  BIOM.layerTypeEnum.POLYGON
            myLayer = new OM.layer.VectorLayer(layerName, {
                def: {
                    type: OM.layer.VectorLayer.TYPE_LOCAL
                }
            });
            myLayer.setLabelingStyle(labelStyle);
        };

        //set the styles on the layer
        myLayer.setRenderingStyle(myStyle);
        myLayer.setSelectStyle(selectStyle);
        myLayer.setHoverStyle(hoverStyle);

        //set the styles on the layer
        if (layerType == 1) {
            var myClusterStyle = biomStyle.getVariableMarkerStyle();
            //cluster the features
            myLayer.enableClustering(true, {
                clusterStyle: myClusterStyle,
                minPointCount: styleSettings.cluster.mincount,
                maxClusteringLevel: 20,
                threshold: styleSettings.cluster.threshold
            });
        }

        myLayer.addFeatures(features);

        //add layer listener
        myLayer.enableFeatureSelection(true);
        myLayer.enableInfoWindow(false);
        myLayer.addListener(OM.event.LayerEvent.FEATURE_SELECTED, this.showInfoWindow);
        myLayer.setOpacity(layerSettings.opacity);

        //boolean tests for extra settings
        if (layerSettings.shadow) myLayer.setVisualFilter(shadow);
        if (layerSettings.zoom) myLayer.zoomToTheme();


    };

    // public API – prototype
    Constr.prototype = {
        constructor: BIOM.WktLayer,
        showInfoWindow: function(evt) {
            oracleMap.closeInfoWindows();
            var feature = evt.selectedFeature;
            //var bg = (feature.renderingStyle.fill) ? feature.renderingStyle.fill : "#FFFFFF";
            var bg = "#FFFFFF";
            console.log(feature);
            var point = oracleMap.getAbsoluteCursorLocation();
            var title = feature.id;
            var content = infoPopup.getInfoWinContent(feature);
            var options = infoPopup.getInfoWinOptions(title, bg);
            oracleMap.displayInfoWindow(point, content, options);
        },
        //return OM.layer
        getLayer: function() {
            return myLayer;
        },
        //return String
        getLayerType: function() {
            return layerType;
        },
        //return array of features
        getFeatures: function() {
            return features;
        },
        //add OM.Layer to OM.Map
        addToMap: function() {
            oracleMap.addLayer(myLayer);
        }
    };

    return Constr;

})();
