ComponentJS.ns("app.fw.abstract");
app.fw.abstract.model = ComponentJS.clazz({
    mixin: [ComponentJS.marker.model],
    dynamics: {},
    protos: {

        create: function () {
            var self = this;
            ComponentJS(self).model({
                "command:focus": {value: false, valid: "boolean", autoreset: true}
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
        },

        hide: function () {
        },

        ready: function () {
        },

        unready: function () {
        }

    }
});