ComponentJS.ns('app.fw.trait.root.service');
app.fw.trait.root.service.ctrl = ComponentJS.trait({
    dynamics: {service: null},
    protos: {

        setup: function () {
            var self = this;
            self.base();
            self.service = ComponentJS("//sv"); // exception: access to sibling-component - only Root is allowed to do that

            self.subscribeForChildEvent("getServiceURLForService", function (ev, service) {
                var result = self.service.call("getServiceURL", service);
                if (result === "" &&
                    typeof service === "string" &&
                    typeof self[service] === "string") {
                    result = self[service];
                }
                return result;
            });
        },

        subscribeDataService: function (serviceName, callback) {
            var self = this;
            self.subscribeForChildEvent(serviceName, function (/*ev*/) {
                if (arguments.length >= 3) {
                    // dividing arguments
                    var successCB = arguments[arguments.length - 2];                       // the next to last argument is the successCB
                    var errorCB = arguments[arguments.length - 1];                         // the last argument ist the errorCB
                    var remainingArguments = Array.prototype.slice.call(arguments, 1, -2); // remaining arguments without ev, successCB und errorCB
                    var serviceArguments = [];
                    serviceArguments.push(serviceName);
                    serviceArguments = serviceArguments.concat(remainingArguments);
                    serviceArguments.push(
                        function (success, result, loginNeeded) {
                            if (success) {
                                var resultObjs;
                                if (typeof callback === "function") {
                                    var callbackArguments = remainingArguments;
                                    callbackArguments.push(result);
                                    resultObjs = callback.apply(self, callbackArguments)
                                }
                                if (typeof successCB === "function") {
                                    successCB(resultObjs);
                                }
                            } else {
                                if (loginNeeded) {
                                    self.handleLogin();
                                }
                                if (typeof errorCB === "function") {
                                    errorCB(result);
                                }
                            }
                        }
                    );
                    self.service.call.apply(self.service, serviceArguments)
                } else {
                    throw new Error("You are calling service(" + serviceName + ") without the proper arguments. Provide at least a success callback handler and an error callback handler");
                }
            });
        }
    }
});