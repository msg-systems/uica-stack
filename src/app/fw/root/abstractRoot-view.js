ComponentJS.ns("app.fw.abstractRoot");
app.fw.abstractRoot.view = ComponentJS.clazz({
    extend: app.fw.abstract.view,
    dynamics: {},
    protos: {

        registerEventBindings: function () {
            var self = this;
            self.base();

            $(window).resize(function () {
                cs(self).value("event:windowResize", true);
            });
        }
    }
});