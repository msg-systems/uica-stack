ComponentJS.ns("app.fw.abstract");
app.fw.abstract.ctrl = ComponentJS.clazz({
    mixin: [
        ComponentJS.marker.controller,
        // handling errors, that occure when calling a backend service
        app.fw.trait.abstract.serviceError.ctrl
    ],
    dynamics: {
        model: null,
        view: null
    },
    protos: {

        create: function (modelClazz, viewClazz) {
            var self = this;

            if (modelClazz && viewClazz) {
                self.model = ComponentJS(self).create("model", modelClazz);
                self.view = self.model.create("view", viewClazz);
            }

            //
            //    S E R V I C E   M E T H O D S
            //
            self.registerAPI("focus", function () {
                self.model.value("command:focus", true)
            });

            this.registerAPIs();
        },

        destroy: function () {
        },

        setup: function () {
        },

        teardown: function () {
        },

        prepare: function () {
            this.subscribeForParentEvents();
            this.subscribeForChildEvents();
            this.observeParentModels();
            this.observeOwnModels();
            this.prepareData();
        },

        cleanup: function () {
        },

        render: function () {
        },

        release: function () {
        },

        show: function () {
            var self = this;
            self.model.value("command:focus", true);
        },

        hide: function () {
        },

        ready: function () {
        },

        unready: function () {
        },

        /**
         * Wraps the ComponentJS subscribe method and sets the proper attributes for events spreading in from parent
         * components. It provides a shortcut for developers to avoid ComponentJS API reading and understanding.
         * @param eventname the parent event name
         * @param callback the function callback for the ComponentJS subscribe method
         * @param [params] additional params from ComponentJS subscribe in case the default is not enough
         */
        subscribeForParentEvent: function (eventname, callback, params) {
            var self = this;
            var subscribeConfig = {
                name: eventname,
                spool: ComponentJS(self).state(),
                spreading: true,
                bubbling: false,
                func: function (ev) {
                    ev.result(callback.apply(self, arguments));
                }
            };
            subscribeConfig = _.merge(subscribeConfig, params);
            ComponentJS(self).subscribe(subscribeConfig)
        },

        /**
         * Wraps the ComponentJS subscribe method and sets the proper attributes for events bubbling in from child
         * components. It provides a shortcut for developers to avoid ComponentJS API reading and understanding.
         * @param eventname the parent event name
         * @param callback the function callback for the ComponentJS subscribe method
         * @param [params] additional params from ComponentJS subscribe in case the default is not enough
         */
        subscribeForChildEvent: function (eventname, callback, params) {
            var self = this;
            var subscribeConfig = {
                name: eventname,
                spool: ComponentJS(self).state(),
                spreading: false,
                bubbling: true,
                func: function (ev) {
                    ev.result(callback.apply(self, arguments));
                }
            };
            subscribeConfig = _.merge(subscribeConfig, params);
            ComponentJS(self).subscribe(subscribeConfig)
        },

        /**
         * Wraps the ComponentJS publish method and sets the proper attributes for events bubbling to parent
         * components. It provides a shortcut for developers to avoid ComponentJS API reading and understanding.
         * Beside publishEventToParent this shortcut method is intended to highlight service calls.
         * Service calls will need a success and error callback as the last arguments. Additionally this method
         * will wrap the success and error callback into a function that swallows ComponentJS errors indicating
         * a component lookup problem which occurs in case that the callback is called asynchronously after the
         * component got destroyed already.
         * @param eventname the parent event name
         * @param [arguments] additional arguments for ComponentJS publish are pushed to args parameter
         */
        publishDataService: function (eventname) {
            var self = this;
            // sanity check the arguments for at least eventname, successCB und errorCB
            if (arguments.length < 3) {
                throw new Error("You are calling service(" + serviceName + ") without the proper arguments. Provide at least a success callback handler and an error callback handler.");
            }
            // sanity check the success callback
            var successCB = arguments[arguments.length - 2];                       // the second last argument is the successCB
            if (typeof successCB !== "function" && successCB !== undefined) {
                throw new Error("You are calling service(" + serviceName + ") without the proper arguments. The second last argument must be the success callback and must be a function.");
            }
            // sanity check the error callback
            var errorCB = arguments[arguments.length - 1];                         // the last argument ist the errorCB
            if (typeof errorCB !== "function" && errorCB !== undefined) {
                throw new Error("You are calling service(" + serviceName + ") without the proper arguments. The last argument must be the error callback and must be a function.");
            }
            var remainingArguments = Array.prototype.slice.call(arguments, 1, -2); // remaining arguments without eventname, successCB und errorCB
            var serviceArguments = [].concat(remainingArguments)
            serviceArguments.push(function successWrapper() {
                try {
                    if (typeof successCB === "function") {
                        successCB.apply(self, arguments)
                    }
                } catch (e) {
                    // ignore the ComponentJS lookup error - because the component is dead already and execution of the callback is useless
                    if (e && e.message.indexOf("[ComponentJS]: ERROR: lookup: invalid base component") !== 0) {
                        throw e
                    }
                }
            })
            serviceArguments.push(function errorWrapper() {
                try {
                    if (typeof errorCB === "function") {
                        errorCB.apply(self, arguments)
                    }
                } catch (e) {
                    // ignore the ComponentJS lookup error - because the component is dead already and execution of the callback is useless
                    if (e && e.message.indexOf("[ComponentJS]: ERROR: lookup: invalid base component") !== 0) {
                        throw e
                    }
                }
            })
            return ComponentJS(self).publish({
                name: eventname,
                spreading: false,
                bubbling: true,
                args: serviceArguments
            }).result();
        },

        /**
         * Wraps the ComponentJS publish method and sets the proper attributes for events bubbling to parent
         * components. It provides a shortcut for developers to avoid ComponentJS API reading and understanding.
         * @param eventname the parent event name
         * @param [arguments] additional arguments for ComponentJS publish are pushed to args parameter
         */
        publishEventToParent: function (eventname) {
            var self = this;
            return ComponentJS(self).publish({
                name: eventname,
                spreading: false,
                bubbling: true,
                args: Array.prototype.slice.call(arguments, 1, arguments.length) // remaining Arguments without eventname
            }).result();
        },

        /**
         * Wraps the ComponentJS publish method and sets the proper attributes for events spreading to child
         * components. It provides a shortcut for developers to avoid ComponentJS API reading and understanding.
         * @param eventname the parent event name
         * @param [arguments] additional arguments for ComponentJS publish are pushed to args parameter
         */
        publishEventToChildren: function (eventname) {
            var self = this;
            return ComponentJS(self).publish({
                name: eventname,
                spreading: true,
                bubbling: false,
                args: Array.prototype.slice.call(arguments, 1, arguments.length) // remaining Arguments without eventname
            }).result();
        },

        /**
         * Wraps the ComponentJS register method.
         * It provides a shortcut for developers to avoid ComponentJS API reading and understanding.
         * @param serviceName The service API name
         * @param callback The callback that should fire when the API is "call"ed
         * @param [params] additional params from ComponentJS subscribe in case the default is not enough
         */
        registerAPI: function (serviceName, callback, params) {
            var self = this;
            var config = {
                name: serviceName,
                spool: ComponentJS(self).state(),
                func: function () {
                    return callback.apply(self, arguments)
                }
            };
            config = _.merge(config, params);
            ComponentJS(self).register(config)
        },

        /**
         * Wraps the ComponentJS observe method and sets the proper attributes for own model fields.
         * It provides a shortcut for developers to avoid ComponentJS API reading and understanding.
         * @param modelname The field in the own model must start with either param:, state:, command:, data: or event:
         * @param callback The callback that should fire when the model field changes
         * @param [params] additional params from ComponentJS observe in case the default is not enough
         */
        observeOwnModel: function (modelname, callback, params) {
            var self = this;
            var regexp = /^(?:global:)?(?:state:|command:|param:|data:|event:).*$/;
            if (modelname) {
                var match = modelname.match(regexp);
                if (match && match.length === 1) {
                    var modelSpec = self.model.property('ComponentJS:model').spec;
                    if (modelSpec[modelname]) {
                        var config = {
                            name: modelname,
                            spool: "..:" + ComponentJS(self).state(),
                            func: function () {
                                callback.apply(self, arguments)
                            }
                        };
                        config = _.merge(config, params);
                        self.model.observe(config);
                    } else {
                        var possibleFields = "";
                        for (var key in modelSpec) {
                            if (possibleFields.length) possibleFields += ", "
                            possibleFields += "'" + key + "'"
                        }
                        throw new Error("own model observer: modelname '" + modelname + "' is not defined in the own model. Possible fields: " + possibleFields);
                    }
                } else {
                    throw new Error("own model observer must start with either param:, state:, command:, data:, event:, " +
                        "global:param:, global:state:, global:command:, global:data: or global:event: " +
                        "- current modelname was " + modelname);
                }
            }
        },

        /**
         * Wraps the ComponentJS observe method and sets the proper attributes for parent model fields.
         * It provides a shortcut for developers to avoid ComponentJS API reading and understanding.
         * @param modelname The field in the own model must start with either global:param:, global:state:,
         *          global:command:, global:data: or global:event:
         * @param callback The callback that should fire when the model field changes
         * @param [params] additional params from ComponentJS observe in case the default is not enough
         */
        observeParentModel: function (modelname, callback, params) {
            var self = this;
            var regexp = /^(?:global:state:|global:command:|global:param:|global:data:|global:event:).*/;
            if (modelname) {
                var match = modelname.match(regexp);
                if (match && match.length === 1) {
                    var modelSpec = self.model.property('ComponentJS:model').spec;
                    if (!modelSpec[modelname]) {
                        var config = {
                            name: modelname,
                            spool: "..:" + ComponentJS(self).state(),
                            func: function () {
                                callback.apply(self, arguments)
                            }
                        };
                        config = _.merge(config, params);
                        self.model.observe(config);
                    } else {
                        throw new Error("parent model observer: modelname '" + modelname + "' is part of the own model. Use observeOwnModel instead");
                    }
                } else {
                    throw new Error("parent model observer must start with either global:param:, global:state:, " +
                        "global:command:, global:data: or global:event: - current modelname was " + modelname);
                }
            }
        },

        /**
         * Hides the component and ensures that it stay disabled even if a parent of it is moving up in the component
         * life cycle. The ComponentJS property has to be always kept in sync with the disabling of the component
         * @param component
         * @param callback
         */
        disableAndHideComponent: function (component, callback) {
            component.property("ComponentJS:state-auto-increase", false);
            var opts = { state: "created", sync: true };
            if (typeof  callback === "function") {
                opts.func = function () {
                    callback()
                }
            }
            component.state(opts);
        },

        /**
         * Shows the component and ensures that it get visible again when a parent of it is moving up in the component
         * life cycle. The ComponentJS property has to be always kept in sync with the enabling of the component
         * @param component
         * @param callback
         */
        enableAndShowComponent: function (component, callback) {
            component.property("ComponentJS:state-auto-increase", true);
            // do nothing if the component is not part of the component tree
            if (component.parent()) {
                var opts = { state: component.parent().state(), sync: true };
                if (typeof  callback === "function") {
                    opts.func = function () {
                        callback()
                    }
                }
                component.state(opts)
            }
        },

        registerAPIs: function () {
        },

        observeOwnModels: function () {
        },

        observeParentModels: function () {
        },

        subscribeForParentEvents: function () {
        },

        subscribeForChildEvents: function () {
        },

        prepareData: function () {

        }

    }
});
