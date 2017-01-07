/**
 * module that develops an OM Infowindow on the basis of settings and data bindings
 * Use BIOM.InfoWin.getInfoWinContent() to get the HTML content and
 * BIOM.InfoWin.getInfoWinOptions(title,bg) to get OM infoWin settings
 * @param {Object} winOptions - object literal of settings for the infoWindow
 * @param {Object} drillOptions - object defining the drill path and params
 * @returns {BIOM.InfoWin}
 */
    BIOM.InfoWin = (function() {

		//return the data to support this call: map.displayInfoWindow(point, content, options);

		// private variables
		var myInfoWindow, Constr, winSettings, drillColumn, drillUrl;

		Constr = function(winOptions, drillOptions) {

			//common window options
			var defaultWinOptions = {
				type: 0,
				w: 160,
				h: 200,
				fontSize: "12px",
				opacity: 0,
				rowcolor: "#FFFFFF",
				color: "#F5F5F9",
				buttonColor: "#111199",
				fontFamily: "Helvetica"
			};
			winSettings = $.extend({}, defaultWinOptions, winOptions || {});


			//common window options
			var defaultDrillOptions = {
			     Action: "Navigate"
			};
			drillParams = $.extend({}, defaultDrillOptions, drillOptions.params || {});

			drillUrl = drillOptions.baseUrl;

			drillColumn = drillOptions.key;

			//build URL from params
			$.each(drillParams, function(key, val) {
				drillUrl += "&" + key + "=" + val;
			});

			console.log("Drill URL is: " + drillUrl);

			//set up info window
			myInfoWinOptions = {
				width: winSettings.w,
				height: winSettings.h,
				title: "FEATURE",
				infoWindowStyle: {
					"background-color": winSettings.color
				},
				titleStyle: {
					"background": winSettings.color,
					"font-size": winSettings.fontSize,
					"font-family": winSettings.fontFamily
				},
				contentStyle: {
					"background": winSettings.color,
					"font-size": winSettings.fontSize,
					"font-color": "white",
					"font-family": winSettings.fontFamily
				},
				tailStyle: {
					"offset": 25,
					"background": winSettings.color
				},
				closeButtonStyle: {
					"mouseOutButton": {
						"src": "/mapviewer/jslib/v2/images/close_en.png"
					},
					"mouseOverButton": {
						"src": "/mapviewer/jslib/v2/images/close_ov.png"
					},
					"width": 14,
					"height": 14,
					"xOffset": 0,
					"yOffset": 0
				}
			};

    };

    // public API – prototype
    Constr.prototype = {
        constructor: BIOM.InfoWin,
        getInfoWinOptions: function(title, bgcolor) {
            myInfoWinOptions.title = title;
            //myInfoWinOptions.titleStyle.background = bgcolor;
            return myInfoWinOptions;
        },
        getInfoWinContent: function(featureData) {
            var html = "";
            var attributes = featureData.getAttributes();
            var style = featureData.getRenderingStyle();
            console.log(style);
            var butColor = winSettings.buttonColor;

			var drillButton = "<a style='background-color: " + butColor + "; border: none; color: white; padding: 2px 2px; " +
				"text-align: center; display: inline-block; font-size:" + winSettings.fontSize + ";' href='" + drillUrl;

            $.each(attributes, function(key, val) {
                if (key == drillColumn) {
                    html += "<tr bgcolor='" + winSettings.rowcolor + "'><td align='right'>" + key + "</td><td align='left'>" + drillButton + "&val1=" + val + "'>Drill On: " + val + "</td></tr>";
                } else {
                    html += "<tr bgcolor='" + winSettings.rowcolor + "'><td align='right'>" + key + "</td><td align='left'><b>" + val + "</b></td></tr>";
                }
            });

            return "<table style='margin:auto'>" + html + "</table>";
        }
    };

    return Constr;

    })();
