// make sure required traits are loaded
if (!(typeof app !== "undefined" && typeof app.fw !== "undefined" && typeof app.fw.trait !== "undefined" && typeof app.fw.trait.root !== "undefined" &&
    typeof app.fw.trait.root.i18next !== "undefined" && typeof app.fw.trait.root.i18next.ctrl !== "undefined")) {
    throw "This is a abstract controller for a root component. It needs to mixin the controller of the trait app.fw.trait.root.i18next. " +
    "Make sure this trait is included and loaded. Do not exclude it manually in the delivery.yaml"
}
if (!(typeof app !== "undefined" && typeof app.fw !== "undefined" && typeof app.fw.trait !== "undefined" && typeof app.fw.trait.abstract !== "undefined" &&
    typeof app.fw.trait.abstract.serviceError !== "undefined" && typeof app.fw.trait.abstract.serviceError.ctrl !== "undefined")) {
    throw "This is a abstract controller for a root component. It needs to mixin the controller of the trait app.fw.trait.abstract.serviceError. " +
    "Make sure this trait is included and loaded. Do not exclude it manually in the delivery.yaml"
}
ComponentJS.ns("app.fw.root");
app.fw.root.ctrl = ComponentJS.clazz({
    extend: app.fw.abstract.ctrl,
    mixin: [
        app.fw.trait.root.i18next.ctrl,
        // handling errors, that occure when calling a backend service
        app.fw.trait.abstract.serviceError.ctrl
    ],
    dynamics: {
        // Timer for resize commandos, so that not every window.resize is forwarded to the components
        // instead a short timeout is used before forwarding
        resizeTimer: null
    },
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

        prepare: function () {
            var self = this;
            self.base();

            self.observeOwnModel("event:windowResize", function (ev, value) {
                if (value) {
                    self.clearResizeTimer();
                    self.resizeTimer = window.setTimeout(function () {
                        self.model.value("global:command:resize", true);
                        self.clearResizeTimer()
                    }, 1000);
                }
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
        },

        clearResizeTimer: function () {
            var self = this;
            if (self.resizeTimer) {
                window.clearTimeout(self.resizeTimer);
                self.resizeTimer = null;
            }
        },

        userLanguage: function () {
            console.error("Please overwrite the method 'userLanguage' in the component ", cs(this).name());
            return "de";
        }
    }
});