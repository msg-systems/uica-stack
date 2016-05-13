ComponentJS.ns("app.fw.root");
app.fw.root.model = ComponentJS.clazz({
    extend: app.fw.abstract.model,
    dynamics: {},
    protos: {

        create: function () {
            var self = this;
            self.base();
            cs(self).model({
                "global:command:resize": {value: false, valid: "boolean", autoreset: true},
                "event:windowResize": {value: false, valid: "boolean", autoreset: true}
            })
        }
    }
});