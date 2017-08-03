ComponentJS.ns("app.fw");
app.fw.sv = ComponentJS.clazz({
    mixin: [
        ComponentJS.marker.service
    ],
    dynamics: {
        SUCCESS: true,
        ERROR: false,
        requestCounter: 0,
        serviceRoot: '',
        userHeader: null,
        userHeaderName: "appuser",
        requestHeaderId: "X-REQUEST-ID",
        messageId: "appService.error.parse",
        // this can be overwritten - if needed - of a service that extends from this service clazz
        defaultServiceOptions: {dataType: 'json'}
    },
    protos: {

        create: function () {
            var self = this;
            ComponentJS(self).register({
                name: "setServiceRoot", spool: ComponentJS(self).state(),
                func: function (serviceRoot) {
                    self.serviceRoot = serviceRoot;
                }
            });

            ComponentJS(self).register({
                name: "getServiceRoot", spool: ComponentJS(self).state(),
                func: function () {
                    return self.serviceRoot;
                }
            });

            ComponentJS(self).register({
                name: "getServiceURL", spool: ComponentJS(self).state(),
                func: function (dynamicAttribute) {
                    var result = "";
                    if (typeof dynamicAttribute === "string" &&
                        typeof self[dynamicAttribute] === "string") {
                        result = self[dynamicAttribute];
                    }
                    return result;
                }
            })
        },

        registerService: function (methodName, serviceName, serviceFunction, callbackFunction) {
            var self = this;
            ComponentJS(self).register({
                name: serviceName,
                spool: "prepared",
                func: function () {
                    app.log("Backend Service - " + serviceName);
                    var result = serviceFunction.apply(self, arguments);
                    var options = result.options || {};
                    options = _.assign(self.defaultServiceOptions, options);
                    var headers = options.headers || {};
                    headers[self.requestHeaderId] = btoa(moment().valueOf() + serviceName + self.requestCounter);
                    if (self.userHeader) headers[self.userHeaderName] = self.userHeader;
                    options.headers = headers;
                    self.requestCounter++;
                    qwest.setDefaultOptions(options);
                    var method = methodName.toLowerCase();
                    qwest[method](result.serviceURL, result.data || null)
                        .then(function (xhr) {
                            var text = xhr.responseText;
                            if (callbackFunction)
                                callbackFunction(null, text, xhr, result.callback);
                            else {
                                try {
                                    var objs = text.length > 0 ? JSON.parse(text) : {};
                                    if (self.hasError(objs)) {
                                        self.handleFunctionalError(objs, result.callback);
                                    } else {
                                        result.callback(self.SUCCESS, objs);
                                    }
                                } catch (e) {
                                    console.log(e.message);
                                    // technical it is an error as well, if the response couldn't be parsed
                                    result.callback(false, {
                                        messageId: self.messageId,
                                        messageParams: []
                                    }, false);
                                }
                            }
                        })
                        .catch(function (e, xhr) {
                            var text = xhr.responseText;
                            // Process the error
                            if (callbackFunction)
                                callbackFunction(e, text, xhr, result.callback);
                            else {
                                // this error happens if the response has status < 200 or >= 300, but not 304
                                self.handleTechnicalError(text, xhr, result.callback);
                            }
                        });
                }
            })
        },

        /**
         * For all request with the statuscode !== (200 - 299 || 304) the error is handled
         * @param text The content of the server response
         * @param xhr The XHR Object
         * @param callback The actual Callback of the calling service
         */
        handleTechnicalError: function (text, xhr, callback) {
            var self = this;
            var result = {};
            var loginRequired = xhr.status === 401;
            try {
                // 1.) Try to parse the content of the response and check if the response is a server error object
                //     if the Content can not be parsed, an error is created (e.g. HTML content)
                result = JSON.parse(text);
                // 1a.) An invalid response Object is converted in an error as well
                if (!self.hasError(result)) {
                    throw new Error("The parsed result object is no legal error object.");
                }
            } catch (e) {
                // 1b.) If an error happens while reading the response objects, these errors will be logged ...
                console.log("Exception while parsing:", e);
                console.log("Text is:", text);
                var textSnippet = text.substring(0, Math.min(text.length - 1, 20));
                if (text.length >= 20) {
                    textSnippet += "..."
                }
                // 1c.) ... and an own error object is created
                result = {
                    messageId: self.messageId,
                    messageParams: []
                }
            }
            callback(false, result, loginRequired);
        },


        hasError: function (responseObj) {
            return responseObj &&
                Object.prototype.toString.call(responseObj) === Object.prototype.toString.call({}) &&
                responseObj.messageId
        },


        handleFunctionalError: function (errorObj, callback) {
            callback(false, errorObj);
        }
    }
});