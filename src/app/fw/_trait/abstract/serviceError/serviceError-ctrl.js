// make sure required artefacts are loaded
if (typeof i18next === "undefined") {
    throw "This trait 'serviceError' for error handling of callbacks from service methods requires i18next to be loaded"
}
ComponentJS.ns("app.fw.trait.abstract.serviceError");
app.fw.trait.abstract.serviceError.ctrl = ComponentJS.trait({
    dynamics: {},
    protos: {

        /**
         * The default error handling callback for service methods is available for every component.
         * When the result object is an error object, this method takes care of the error analysis and it creates
         * the proper messages and throws it to the top level error handler with publish("fw:handleError")
         * @param result the result object as a legal error object
         */
        onError: function (result) {
            var self = this;
            var errorCodeLabel1 = i18next.t("app.errorCodeLabel1");
            var errorCodeLabel2 = i18next.t("app.errorCodeLabel2");
            var messageId = result.messageId || '';
            var messageParams = result.messageParams || '';
            var error = errorCodeLabel1 + "<br />" + errorCodeLabel2 + ": ";

            if (messageId) {
                var i18nText = i18next.t(messageId);
                if (i18nText) {
                    var re = new RegExp(messageId, 'i');
                    if (i18nText.match(re) === null) {
                        try {
                            error += (_.isArray(messageParams) ? sprintf.apply(self, [i18nText].concat(messageParams)).replace(/\\n/g, "<br />") : i18nText);
                        } catch (e) {
                            error += messageId + " - " + i18next.t("app.wrongMessageParameters") + ": " + e.toString();
                        }
                    } else {
                        error += messageId + " - " + i18next.t("app.noTextDefinedForMessage");
                    }
                } else {
                    error += messageId + " - " + i18next.t("app.emptyTextForMessage");
                }
            }
            self.publishEventToParent("fw:handleError", error);
        }
    }
});