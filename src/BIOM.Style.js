/**
 * module that develops an OM Style on the basis of settings and data bindings
 * Use BIOM.Style.getStyle() to get the OM Style
 * @param {Enum} layerType - integer code for the type of layer being stylized
 * @param {Object} options - object literal of settings for the style - has sub objects
 * @param {Object} bindData - array of data columns for binding Color and Fill
 * @returns {BIOM.Marker}
 */
BIOM.Style = (function() {

    // private variables
    var myStyle, myLabelStyle, mySelectStyle, myHoverStyle, myVariableMarker, colorFormatter, sizeFormatter, bindAry, StyleConstr;

    StyleConstr = function(layerType, options, featureDataAry) {

        console.log("Getting a BIOM Style for: " + BIOM.layerTypeEnum.properties[layerType].name);

        bindAry = featureDataAry;

        //options
        var defaultOptions = {
            marker: {},
            shape: {},
            label: {},
            cluster: {},
            heat: {},
            bind: {
                type: 0,
                size: {},
                color: {}
            }
        };
        var settings = $.extend({}, defaultOptions, options || {});


        //shape options
        var defaultShapeOptions = {
            color: "#FF9933",
            linecolor: "#FFFFFF",
            lineweight: 1,
            opacity: 0.75,
            color_s: "#F0E68C",
            strokecolor_s: "#FFD700",
            opacity_s: 0.5,
            color_h: "#F0E68C",
            strokecolor_h: "#FFD700",
            opacity_h: 1
        };
        var shapeSettings = $.extend({}, defaultShapeOptions, settings.shape || {});

        //marker options
        var defaultMarkerOptions = {
            color: "#FF9933",
            size: 15,
            name: 0,
            type: 0,
            opacity: 0.75,
            color_s: "#F0E68C",
            strokecolor_s: "#FFD700",
            opacity_s: 0.5,
            color_h: "#F0E68C",
            strokecolor_h: "#FFD700",
            opacity_h: 1
        };
        var markerSettings = $.extend({}, defaultMarkerOptions, settings.marker || {});

        //heat options
        var defaultHeatOptions = {
            radius: 40,
            ramp: "OrRd",
            steps: "4",
            source: "COUNT",
            unit: "pixel",
            scare: true
        };
        var heatSettings = $.extend({}, defaultHeatOptions, settings.heat || {});

        //label options
        var defaultLabelOptions = {
            color: "white",
            size: 8,
            name: "Helvetica"
        };
        var labelSettings = $.extend({}, defaultLabelOptions, settings.label || {});
        myLabelStyle = new OM.style.Text({
            styleName: "Bold Text",
            fontSize: labelSettings.size,
            fontWeight: OM.Text.FONTWEIGHT_BOLD,
            fill: labelSettings.color,
            fontFamily: labelSettings.name
        });

        //cluster options
        var defaultClusterOptions = {
            start: 20,
            steps: 5,
            increment: 10,
            mincount: 1,
            threshold: 40,
            class: "equal"
        };
        var clusterSettings = $.extend({}, defaultClusterOptions, settings.cluster || {});

        //bind options
        var defaultBindOptions = {
            type: 0,
            size: {
                idcol: "ID",
                valcol: "COUNT",
                delta: 10,
                steps: 5
            },
            color: {
                idcol: "ID",
                valcol: "COUNT",
                ramp: "OrRd",
                steps: "5",
                scale: "log"
            }
        };
        var bindSettings = $.extend({}, defaultBindOptions, settings.bind || {});
        var bindType = bindSettings.type;

        //set specific style information based on layer type
        switch (layerType) {
            //----------------------
            //0 or 1 -- point and cluster
            case BIOM.layerTypeEnum.POINT_CLUSTER:
            case BIOM.layerTypeEnum.POINT:
                myStyle = new OM.style.Marker({
                    xOffset: 0,
                    yOffset: 0,
                    width: markerSettings.size,
                    height: markerSettings.size,
                    vectorDef: [{
                        shape: BIOM.pointShapeEnum.properties[markerSettings.name],
                        style: {
                            fill: markerSettings.color,
                            stroke: markerSettings.color,
                            fillOpacity: markerSettings.opacity,
                            strokeOpacity: 0,
                            strokeThickness: 0
                        }
                    }],
                    textStyle: myLabelStyle,
                    textOffset: {
                        x: 0,
                        y: 0
                    }
                });

                mySelectStyle = new OM.style.Marker({
                    xOffset: 0,
                    yOffset: 0,
                    width: markerSettings.size,
                    height: markerSettings.size,
                    vectorDef: [{
                        shape: BIOM.pointShapeEnum.properties[markerSettings.name],
                        style: {
                            fill: markerSettings.color_s,
                            stroke: markerSettings.strokecolor_s,
                            fillOpacity: markerSettings.opacity_h,
                            strokeOpacity: 1,
                            strokeThickness: 2
                        }
                    }],
                    textStyle: myLabelStyle,
                    textOffset: {
                        x: 0,
                        y: 0
                    }
                });

                myHoverStyle = new OM.style.Marker({
                    xOffset: 0,
                    yOffset: 0,
                    width: markerSettings.size,
                    height: markerSettings.size,
                    vectorDef: [{
                        shape: BIOM.pointShapeEnum.properties[markerSettings.name],
                        style: {
                            fill: markerSettings.color_h,
                            stroke: markerSettings.strokecolor_h,
                            fillOpacity: markerSettings.opacity_h,
                            strokeOpacity: 1,
                            strokeThickness: 1
                        }
                    }],
                    textStyle: myLabelStyle,
                    textOffset: {
                        x: 0,
                        y: 0
                    }
                });

                break;

            //----------------------
            //2 -- point heatmap
            case BIOM.layerTypeEnum.POINT_HEATMAP:

                var ramp = heatSettings.ramp;
                var classes = heatSettings.steps.toString();
                var cbRamp = (OM.style.colorbrewer[ramp]) ? OM.style.colorbrewer[ramp][classes] : OM.style.colorbrewer.OrRd[classes];
                var colors = [];
                if (heatSettings.scare) {
                    colors = ["transparent"];
                    colors.concat(cbRamp);
                } else {
                    colors = cbRamp;
                }

                myStyle = new OM.style.HeatMap({
                    spotlightRadius: heatSettings.radius,
                    lengthUnit: heatSettings.unit,
                    colorStops: colors,
                    opacity: heatSettings.opacity
                });

                break;

            //----------------------
            //3 -- line
            case BIOM.layerTypeEnum.LINE:
                break;

            //----------------------
            //4 -- polygon
            case BIOM.layerTypeEnum.POLYGON:

                myStyle = new OM.style.Color({
                    "fill": shapeSettings.color,
                    "strokeThickness": shapeSettings.lineweight,
                    "stroke": shapeSettings.linecolor,
                    "fillOpacity": shapeSettings.opacity,
                    textStyle: myLabelStyle,
                    "gradient": "off"
                });

                mySelectStyle = new OM.style.Color({
                    "fill": shapeSettings.color_s,
                    "strokeThickness": shapeSettings.lineweight_s,
                    "stroke": shapeSettings.linecolor_s,
                    "fillOpacity": shapeSettings.opacity_s,
                    textStyle: myLabelStyle,
                    "gradient": "off"
                });

                myHoverStyle = new OM.style.Color({
                    "fill": shapeSettings.color_h,
                    "strokeThickness": shapeSettings.lineweight_h,
                    "stroke": shapeSettings.linecolor_h,
                    "fillOpacity": shapeSettings.opacity_h,
                    textStyle: myLabelStyle,
                    "gradient": "off"
                });

                break;

            default:
                break;

        }; //end layertype switches

        //provide a variable marker if clustered
        if (layerType == BIOM.layerTypeEnum.POINT_CLUSTER) {
            myVariableMarker = new OM.style.VariableMarker({
                classification: clusterSettings.class,
                marker: myStyle,
                startSize: clusterSettings.start,
                increment: clusterSettings.increment,
                numClasses: clusterSettings.steps
            });
        };

        console.log("In Style - binding for: " + BIOM.bindingTypeEnum.properties[bindType].type);
        console.log(bindSettings);

        //switch on bindings
        switch (bindType) {
            case BIOM.bindingTypeEnum.NONE:
                //no bindings - just break
                break;

            case BIOM.bindingTypeEnum.SIZE:
                this.bindSize(bindSettings.size);
                break;

            case BIOM.bindingTypeEnum.COLOR:
                this.bindColor(bindSettings.color);
                break;

            case BIOM.bindingTypeEnum.SIZE_COLOR:
                this.bindSize(bindSettings.size);
                this.bindColor(bindSettings.color);
                break;

            default:
                break;
        }; //end binding switches
    };

    // public API – prototype
    StyleConstr.prototype = {
        constructor: BIOM.Style,
        bindColor: function(bindOpt) {
            //color formatter
            var cbRamp = (OM.style.colorbrewer[bindOpt.ramp]) ? OM.style.colorbrewer[bindOpt.ramp][bindOpt.steps] : OM.style.colorbrewer.OrRd[bindOpt.steps];
            colorFormatter = new OM.style.ColorFormatter({
                style: myStyle, //optional, tells the formatter which style it will be affecting
                colors: cbRamp, //a 7-color series from colorbrewer
                scale: bindOpt.scale //map the colors to the values using a logarithmic scale or
            });

            var measureColumn = new OM.Column({
                data: bindAry, //an array of features
                keyGetter: function() {
                    return this.attributes[bindOpt.idcol];
                }, //'this' here always refers to an element of the data array.
                valueGetter: function() {
                    return this.attributes[bindOpt.valcol];
                },
            });

            myStyle.bindData('Fill', measureColumn, colorFormatter);

        },
        bindSize: function(bindOpt) {
            //size formatter
            sizeFormatter = new OM.style.SizeFormatter({
                startingSize: 10,
                numClasses: bindOpt.steps,
                delta: bindOpt.delta,
                scale: bindOpt.scale
            });

            var measureColumn = new OM.Column({
                data: bindAry, //an array of <key, value> pairs loaded from data package
                keyGetter: function() {
                    return this.attributes[bindOpt.idcol];
                }, //'this' here always refers to an element of the data array.
                valueGetter: function() {
                    return this.attributes[bindOpt.valcol];
                },
            });

            myStyle.bindData('Size', measureColumn, sizeFormatter);
            mySelectStyle.bindData('Size', measureColumn, sizeFormatter);
            myHoverStyle.bindData('Size', measureColumn, sizeFormatter);

        },
        bindLineWeight: function(bindOpt) {
            //size formatter
            sizeFormatter = new OM.style.SizeFormatter({
                startingSize: 10,
                numClasses: bindOpt.steps,
                delta: bindOpt.delta,
                scale: bindOpt.scale
            });

            var measureColumn = new OM.Column({
                data: bindAry, //an array of <key, value> pairs loaded from data package
                keyGetter: function() {
                    return this.attributes[bindOpt.idcol];
                }, //'this' here always refers to an element of the data array.
                valueGetter: function() {
                    return this.attributes[bindOpt.valcol];
                },
            });

            myStyle.bindData("StrokeThickness", measureColumn, sizeFormatter);
            mySelectStyle.bindData("StrokeThickness", measureColumn, sizeFormatter);
            myHoverStyle.bindData("StrokeThickness", measureColumn, sizeFormatter);

        },
        getStyle: function() {
            return myStyle;
        },
        getSelectStyle: function() {
            return mySelectStyle;
        },
        getHoverStyle: function() {
            return myHoverStyle;
        },
        getLabelStyle: function() {
            return myLabelStyle;
        },
        getVariableMarkerStyle: function() {
            return myVariableMarker;
        }
    };

    return StyleConstr;

})();
