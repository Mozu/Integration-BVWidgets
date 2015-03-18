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
                listName: 'bvsettings@mzint',
                id: Api.context.site
            });
            res.then(function(r) {
                var data = r.data.items[0];
                var staging = "-stg";
                if (data.environment != "Staging") {
                    staging = "";
                }

                var isWidget = $("#bvProductDetail").val() == 1;
                var isROIWidget = $("#bvROIWidget").val() == 1;
                var isContainerPage = $("#containerPage").val() == 1;
                var deploymentZone = data.deploymentZone.replace(" ", "_");
                var locale = Api.context.locale.replace("-", "_");
                var bvScript = "//display" + staging + ".ugc.bazaarvoice.com/static/" + data.clientName + "/" + locale + "/bvapi.js";


                $.getScript(bvScript)
                    .done(function(script, textStatus) {
                        if (isWidget) {
                            var currentProduct = ProductModels.Product.fromCurrent();
                            $BV.configure('global', {
                                productId: currentProduct.id
                            });
                            var tabCode = $('[data-mz-bv-config]').data('mzBvConfig').tabCode;
                            var widgetType = $('[data-mz-bv-config]').data('mzBvConfig').widgetType;
                            $BV.ui('rr', 'show_reviews', {
                                doShowContent: function() {
                                    if (widgetType == "summary") {
                                        showReviewSummary();
                                    }
                                }
                            });

                            $BV.ui('qa', 'show_questions', {
                                doShowContent: function() {

                                }
                            });
                        } else if (isROIWidget) {
                            var order = OrderModels.Order.fromCurrent().attributes;

                            var bvOrder = {};
                            bvOrder["orderId"] = order.orderNumber;
                            bvOrder["tax"] = order.taxTotal;
                            bvOrder["shipping"] = order.shippingTotal;
                            bvOrder["total"] = order.total;
                            bvOrder["city"] = order.billingInfo.billingContact.address.cityOrTown;
                            bvOrder["state"] = order.billingInfo.billingContact.address.stateOrProvince;
                            bvOrder["country"] = order.billingInfo.billingContact.address.countryCode;
                            bvOrder["currency"] = order.currencyCode;
                            bvOrder["email"] = order.email;
                            bvOrder["locale"] = locale;
                            var address = {};
                            if (order.fulfillmentInfo !== null && order.fulfillmentInfo.fulfillmentContact !== null) {
                                address = order.fulfillmentInfo.fulfillmentContact.address;
                                bvOrder["nickname"] = order.fulfillmentInfo.fulfillmentContact.firstName;
                            } else {
                                address = order.billingInfo.billingContact.address;
                                bvOrder["nickname"] = order.billingInfo.billingContact.firstName;
                            }
                            bvOrder["city"] = address.cityOrTown;
                            bvOrder["state"] = address.stateOrProvince;
                            bvOrder["country"] = address.countryCode;
                            var items = [];
                            var item = {};

                            for (var i = 0; i < order.items.models.length; i++) {
                                var lineItem = order.items.models[i].attributes;
                                item["sku"] = lineItem.product.attributes.productCode;
                                item["name"] = lineItem.product.attributes.name;
                                if (lineItem.product.attributes.categories.length > 0) {
                                    item["category"] = lineItem.product.attributes.categories[0].id;
                                    item["price"] = lineItem.total;
                                }
                                item["quantity"] = lineItem.quantity;
                                if (lineItem.product.attributes.imageUrl !== null) {
                                    item["imageURL"] = lineItem.product.attributes.imageUrl;
                                }
                                items[i] = item;
                            }
                            bvOrder["items"] = items;
                            $BV.SI.trackTransactionPageView(bvOrder);
                        } else if (isContainerPage) {
                            $BV.container('global', {});
                        }
                        
                        var hash = {};
                        $('.bvr-inline-rating').each(function() {
                                var $this = $(this);
                                var productCode = $this.data('mzProductCode');
                                hash[productCode] = {
                                    url: $this.data('mzProductUrl'),
                                    containerId: $this.attr('id')
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
