ComponentJS.ns("app.fw.abstract");
app.fw.abstract.view = ComponentJS.clazz({
    mixin: [ComponentJS.marker.view],
    dynamics: {
        vue: null,
        ui: null,
        model: null,
        markupName: null,
        markupParams: {},
        useDefaultPlug: true,
        useVue: true
    },
    protos: {

        create: function () {
            // due to component hierarchie and visibility pattern - if the view needs values from its model
            // it can ask herself for values and we shortcut the view as its model
            this.model = ComponentJS(this)
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
            var self = this;
            if (this.useVue && ComponentJS.plugin("vue")) {
                var template = $.markup.render(self.markupName, self.markupParams)
                if (template) {
                    self.vue = ComponentJS(this).vue({
                        options: {
                            template: template
                        },
                        spool: ComponentJS(self).state()
                    })
                    self.ui = $(self.vue.$el).localize();
                } else {
                    self.vue = null;
                    self.ui = $.markup(self.markupName, self.markupParams).localize();
                }
            } else {
                self.vue = null;
                self.ui = $.markup(self.markupName, self.markupParams).localize();
            }
            self.prepareMaskReferences();
            self.prepareMaskRendering();
            self.registerCommandBindings();
            self.registerEventBindings();
            self.registerStateBindings();
            self.registerDataBindings();
            if (self.useDefaultPlug) {
                ComponentJS(self).plug({object: self.ui, spool: ComponentJS(self).state()});
            }
        },

        release: function () {
        },

        show: function () {
        },

        hide: function () {
        },

        ready: function () {
        },

        unready: function () {
        },

        prepareMaskReferences: function () {
        },

        prepareMaskRendering: function () {
        },

        registerCommandBindings: function () {
            var self = this;
            self.observeOwnModel("command:focus", function (ev, value) {
                if (value)
                    self.focus()
            })
        },

        registerEventBindings: function () {
        },

        registerStateBindings: function () {
        },

        registerDataBindings: function () {
        },

        focus: function () {
            //muss überschrieben werden, wenn benötigt
        },

        enableButton: function (button, enabled) {
            if (enabled) {
                if (button.is("button") || button.is("input")) {
                    button.removeAttr("disabled");
                } else {
                    button.removeClass("disabled");
                }
            }
            else {
                if (button.is("button") || button.is("input")) {
                    button.attr("disabled", "disabled");
                } else {
                    button.addClass("disabled");
                }
            }
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
                            spool: ComponentJS(self).state(),
                            func: function () {
                                callback.apply(self, arguments)
                            }
                        };
                        config = _.merge(config, params);
                        ComponentJS(self).observe(config);
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
                        ComponentJS(self).observe(config);
                    } else {
                        throw new Error("parent model observer: modelname '" + modelname + "' is part of the own model. Use observeOwnModel instead");
                    }
                } else {
                    throw new Error("parent model observer must start with either global:param:, global:state:, " +
                        "global:command:, global:data: or global:event: - current modelname was " + modelname);
                }
            }
        }

    }
});