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

        },

        destroy: function () {
        },

        setup: function () {
        },

        teardown: function () {
        },

        prepare: function () {
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
            var opts = { state: component.parent().state(), sync: true };
            if (typeof  callback === "function") {
                opts.func = function () {
                    callback()
                }
            }
            component.state(opts)
        }

    }
});
