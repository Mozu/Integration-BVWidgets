/*global $BV, jQuery, showReviewSummary*/
/*jshint sub:true*/
require([
        'modules/jquery-mozu',
        'hyprlive',
        "modules/backbone-mozu",
        "modules/models-product",
        "modules/api",
        'modules/models-orders'
    ],
    function($, Hypr, Backbone, ProductModels, Api, OrderModels) {

        $(document).ready(function() {

            var res = Api.get('entityList', {
                listName: 'bvsettings@mozuadmin',
                id: Api.context.site
            });
            res.then(function(r) {
                var data = r.data.items[0];
                var staging = "-stg";
                if (data.environment != "Staging") {
                    staging = "";
                }
                var group = data.groupName;

                var deploymentZone = data.deploymentZone;
                var locale = Api.context.locale.replace("-", "_");
                var bvScript = "//display" + staging + ".ugc.bazaarvoice.com/static/" + data.clientName + "/"+ deploymentZone +"/" + locale + "/bvapi.js";

                $.getScript(bvScript)
                    .done(function(script, textStatus) {
                        var hash = {};
                        $('.bvr-inline-rating').each(function() {
                            console.log("third point");
                                var $this = $(this);
                                var productCode = group + "-" +$this.attr('id').split("-")[1];
                                var id = $this.attr('id').split("-")[0] + "-" +productCode;
                                document.getElementById($this.attr('id')).id = id;
                                hash[productCode] = {
                                    url: $this.data('mzProductUrl'),
                                    containerId: id
                                };
                        });
        
                        if (!jQuery.isEmptyObject(hash)) { 
                            var products = {};
                            products["productIds"] = hash;
                            products["containerPrefix"] = "BVRRInlineRating";
                            $BV.ui('rr', 'inline_ratings', products);
                        }
                    })
                    .fail(function(jqxhr, settings, exception) {
                        console.log(jqxhr);
                    });
            });

        });
    });
