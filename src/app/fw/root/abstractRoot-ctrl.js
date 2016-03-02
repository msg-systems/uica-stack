ComponentJS.ns("app.fw.abstractRoot");
app.fw.abstractRoot.ctrl = ComponentJS.clazz({
    extend: app.fw.abstract.ctrl,
    mixin: [
        // general service component handling (abstract service registration)
        app.fw.trait.root.service.ctrl
    ],
    dynamics: {
        // Timer for resize commandos, so that not every window.resize is forwarded to the components
        // instead a short timeout is used before forwarding
        resizeTimer: null
    },
    protos: {

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

        clearResizeTimer: function () {
            var self = this;
            if (self.resizeTimer) {
                window.clearTimeout(self.resizeTimer);
                self.resizeTimer = null;
            }
        }
    }
});