ComponentJS.ns('app.fw.trait.root.i18next');
app.fw.trait.root.i18next.ctrl = ComponentJS.trait({
    dynamics: {
        resourcePath: 'app/{{lng}}-translation.json'
    },
    protos: {

        // when this trait is included, the method 'userLanguage' must be defined from the component,
        // that includes this trait

        setup: function () {
            var self = this;
            self.base();

            //
            //    I N I T   I 1 8 N E X T   R E S O U R C E S
            //
            ComponentJS(self).guard('prepare', +1);
            var userLanguage;
            try {
                userLanguage = self.userLanguage();
            } catch (e) {
                console.error("Please overwrite the method \"userLanguage\" in the component ", ComponentJS(this).name(), " when you include the trait \"app.fw.trait.root.i18next\"");
            }
            try {
                jqueryI18next.init(i18next, $);
                i18next
                    .use(i18nextXHRBackend)
                    .init({
                        preload: ['de', 'en'],
                        lng: userLanguage,
                        fallbackLng: 'de',
                        debug: false,
                        backend: {
                            loadPath: self.resourcePath
                        }
                    }, function () {
                        ComponentJS(self).guard('prepare', -1)
                    });
            } catch (e) {
                ComponentJS(self).guard('prepare', -1)
            }
        }
    }
});