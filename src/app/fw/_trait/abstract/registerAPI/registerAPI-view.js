ComponentJS.ns("app.fw.trait.abstract.registerAPI");
app.fw.trait.abstract.registerAPI.view = ComponentJS.trait({
    protos: {

        /**
         * Wraps the ComponentJS register method.
         * It provides a shortcut for developers to avoid ComponentJS API reading and understanding.
         * @param serviceName The service API name
         * @param callback The callback that should fire when the API is "call"ed
         * @param [params] additional params from ComponentJS subscribe in case the default is not enough
         */
        registerAPI: function (serviceName, callback, params) {
            var self = this;
            var regexp = /markup/i;
            if (serviceName) {
                var match = serviceName.match(regexp);
                if (match && match.length === 1) {
                    var config = {
                        name: serviceName,
                        spool: ComponentJS(self).state(),
                        func: function () {
                            return callback.apply(self, arguments)
                        }
                    };
                    config = _.merge(config, params);
                    ComponentJS(self).register(config)
                } else {
                    throw new Error("registerAPI serviceName must contain 'markup' but has not: " + serviceName +
                        ". A Controller is only allowed to call a registered method of the view to get a views markup.");
                }
            }
        },

        getMarkup: function (markupName, params) {
            if (params)
                return $.markup(markupName, params)
            else
                return $.markup(markupName)
        }
    }
});