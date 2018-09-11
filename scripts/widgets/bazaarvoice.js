/* jshint scripturl: true */
/*global BV*/

define(['modules/jquery-mozu','underscore', 'hyprlive', "modules/backbone-mozu", "modules/models-product", "modules/api", 'modules/models-orders', 'hyprlivecontext'],
    function($, _, Hypr, Backbone, ProductModels, Api, OrderModels, HyprLiveContext) {
		var returnUrl = window.location.href;

		var mzBazaarVoice = {
			getConfig: function() {
				return Api.get('entityList', {
	                listName: 'bvsettings@a0842dd',
	                id: Api.context.site
	            }).then(function(result){
	            	return result.data.items[0];
	            });
			},
			getProductCode: function(config, productCode) {
				var bvProductCode = config.groupName + "-" + productCode;
				return bvProductCode;
			},
			getCategoryCode: function(config, categoryCode) {
				var bvCategoryCode = categoryCode.length>0?config.groupName + "-" + categoryCode:'';
				return bvCategoryCode;
			},
			trackTransaction : function(order, config, bvScript){
				
				$.getScript(bvScript)
					.done(function(script, textStatus){
						var bvOrder = {
							"currency":order.currencyCode,
							"orderId":order.orderNumber, 
							"total":order.discountedTotal
						};
						var items = [];
						for (var i = 0; i < order.items.models.length; i++) {
							var item = {};
		                    var lineItem = order.items.models[i].attributes;
		                    item.sku = lineItem.product.attributes.productCode;
		                    if (lineItem.product.attributes.categories.length > 0) {
		                        item.price = lineItem.unitPrice.extendedAmount;
		                    }
		                    item.quantity = lineItem.quantity;
		                    items[i] = item;
		                }

						bvOrder.items = items;
						BV.pixel.trackTransaction(bvOrder);
					});
			}
		};

		$(document).ready(function () {
		
		    mzBazaarVoice.getConfig().then(function(config){
			    var currentProduct = ProductModels.Product.fromCurrent();
			    var bvProductCode = mzBazaarVoice.getProductCode(config,currentProduct.attributes.productCode);
			    var locale = Api.context.locale.replace("-", "_");
			    var deploymentZone = config.deploymentZone.replace(" ", "_").toLowerCase();

			    $(".bv_object").attr("data-bv-product-id",bvProductCode);

				var ele = document.createElement('script');
				var script = "https://apps.bazaarvoice.com/deployments/"+config.ftpUserName+"/"+deploymentZone+"/"+config.environment.toLowerCase()+"/"+locale+"/bv.js";
			    ele.src = script;
			    document.getElementsByTagName('head')[0].appendChild(ele);
			    console.log(config);				

				if($("#bvPixelWidget").val() == 1){
			    	var order = OrderModels.Order.fromCurrent().attributes;
			    	console.log(order);
			    	mzBazaarVoice.trackTransaction(order,config, script);
			    }
			});
		});
});