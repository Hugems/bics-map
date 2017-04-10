/**
 * module that parses WKT geometry into OM Geometry
 * Use BIOM.parser.getGeom(wkt) to get the OM Geom
 */
    BIOM.parser = (function() {

        var srid = 8307;

        //parse WKT geometry into OM Geometry
        var regExes = {
            'typeStr': /^\s*(\w+)\s*\(\s*(.*)\s*\)\s*$/,
            'spaces': /\s+/,
            'leadingSpace': /^\s?/,
            'parenComma': /\)\s*,\s*\(/,
            'doubleParenComma': /\)\s*\)\s*,\s*\(\s*\(/, // can't use {2} here
            'trimParens': /^\s*\(?(.*?)\)?\s*$/,
            'numberRegexp': /[-+]?([0-9]*\.[0-9]+|[0-9]+)([eE][-+]?[0-9]+)?/
        };
        /**
		 * @param {Object[]} dataPkg - array of Objects
		 * expects formatted data Objects like this:
		      {id:"unique id" wkt:"wkt geom str", label:"str", attributes:{attr1:"", attr2:"", etc}}
		 * returns Array of OM.Feature
 		 */
        function publicParseData(dataPkg) {
			var featArray = [];
			for (var i = 0; i < dataPkg.length; i++) {
				var geom = {};
				geom = this.getGeom(dataPkg[i].wkt);
				//no feature without a geom
				if (OM.notNull(geom)) {
					var feat = new OM.Feature(dataPkg[i].id, geom, {
						attributes: dataPkg[i].attributes,
						label: dataPkg[i].label
					});
					feat.setMarkerText(dataPkg[i].label);
					featArray.push(feat);
				}
			}
			return featArray;
        };

        function publicGetGeom(wkt) {
            var geom, type, str;
            wkt = wkt.replace(/[\n\r]/g, " ");
            var matches = regExes.typeStr.exec(wkt);
            if (matches) {
                type = matches[1].toLowerCase();
                str = matches[2];
                if (parseGeom[type]) {
                    geom = parseGeom[type].apply(this, [str]);
                }
            }
            return geom;
        };

        var parseGeom = {
            /**
             * Return point feature given a point WKT fragment.
             * @param {String} str A WKT fragment representing the point 'X Y'
             * @returns {Array} 2 ordinates
             * @private
             */
            'coords': function(str) {
                var coords = str.split(regExes.spaces);
                return coords;
            },
            /**
             * Return point feature given a point WKT fragment.
             * @param {String} str A WKT fragment representing the point
             * @returns {OM.geometry.Point} A point geom
             * @private
             */
            'point': function(str) {
                var coords = parseGeom.coords(str);
                return new OM.geometry.Point(coords[0], coords[1], srid);
            },
            /**
             * Return a multipoint feature given a multipoint WKT fragment.
             * @param {String} str A WKT fragment representing the multipoint
             * @returns {OM.geometry.MultiPoint} A multipoint geom
             * @private
             */
            'multipoint': function(str) {
                var point;
                var points = str.split(',');
                var ordinates = [];
                for (var i = 0, len = points.length; i < len; ++i) {
                    point = points[i].replace(regExes.trimParens, '$1');
                    ordinates.push.apply(ordinates, parseGeom.coords(point));
                }
                return new OM.geometry.MultiPoint(ordinates, srid);
            },

            /**
             * Return a linestring feature given a linestring WKT fragment.
             * @param {String} str A WKT fragment representing the linestring
             * @returns {OM.geometry.LineString} A linestring feature
             * @private
             */
            'linestring': function(str) {
                console.log("LINESTRING");
                var point;
                var points = str.split(',');
                var ordinates = [];
                for (var i = 0, len = points.length; i < len; ++i) {
                    point = points[i].replace(regExes.leadingSpace, '');
                    ordinates.push.apply(ordinates, parseGeom.coords(point));
                }
                return new OM.geometry.LineString(ordinates, srid);
            },

            /**
             * Return a multilinestring feature given a multilinestring WKT fragment.
             * @param {String} str A WKT fragment representing the multilinestring
             * @returns {OM.geometry.MultiLineString} A multilinestring feature
             * @private
             */
            'multilinestring': function(str) {
                var line;
                var lines = str.split(regExes.parenComma);
                var components = [];
                for (var i = 0, len = lines.length; i < len; ++i) {
                    line = lines[i].replace(regExes.trimParens, '$1');
                    components.push(parseGeom.linestring(line).getOrdinates());
                }
                return new OM.geometry.MultiLineString(components, srid);
            },

            /**
             * Return a polygon feature given a polygon WKT fragment.
             * @param {String} str A WKT fragment representing the polygon
             * @returns {OM.geometry.Polygon} A polygon feature
             * @private
             */
            'polygon': function(str) {
                var ring, linestringAry;
                var rings = str.split(regExes.parenComma);
                var components = [];
                for (var i = 0, len = rings.length; i < len; ++i) {
                    ring = rings[i].replace(regExes.trimParens, '$1');
                    linestringAry = parseGeom.linestring(ring).getOrdinates();
                    components.push(linestringAry);
                }
                return new OM.geometry.Polygon(components, srid);
            },

            /**
             * Return a multipolygon feature given a multipolygon WKT fragment.
             * @param {String} str A WKT fragment representing the multipolygon
             * @returns {OM.geometry.MultiPolygon} A multipolygon feature
             * @private
             */
            'multipolygon': function(str) {
                var polygon;
                var polygons = OpenLayers.String.trim(str).split(regExes.doubleParenComma);
                var components = [];
                for (var i = 0, len = polygons.length; i < len; ++i) {
                    polygon = polygons[i].replace(regExes.trimParens, '$1');
                    components.push(parseGeom.polygon.apply(this, [polygon]).geometry);
                }
                new OM.geometry.MultiPolygon(components);
            },

            /**
             * Return an array of features given a geometrycollection WKT fragment.
             * @param {String} str A WKT fragment representing the geometrycollection
             * @returns {Array} An array of OpenLayers.Feature.Vector
             * @private

            'geometrycollection': function(str) {
            	// separate components of the collection with |
            	str = str.replace(/,\s*([A-Za-z])/g, '|$1');
            	var wktArray = OpenLayers.String.trim(str).split('|');
            	var components = [];
            	for(var i=0, len=wktArray.length; i<len; ++i) {
            		components.push(OpenLayers.Format.WKT.prototype.read.apply(this,[wktArray[i]]));
            	}
            	return components;
            }
            */

        };

        // Reveal public pointers to
        // private functions and properties
        return {
            getGeom: publicGetGeom,
            parseData: publicParseData,
            regExes: regExes

        };

    })();