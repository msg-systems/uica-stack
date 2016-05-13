ComponentJS.ns("app.fw.root");
app.fw.root.view = ComponentJS.clazz({
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