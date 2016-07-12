var glob = require("glob");
var path = require("path");
var fs = require("fs");
var YAML = require("js-yaml");
var em = require("datamodeljs");

module.exports = (function () {

    var dm = em.dm("yaml");

    dm.define("YAML", {
        id: "@string",
        package: "string",
        desc: "string",
        interface: "object"
    });
    dm.define("Interface", {
        api: "@object",
        events: "object",
        model: "object",
        ui: "object"
    });
    dm.define("Api", {
        register: "@object",
        call: "object"
    });
    dm.define("Events", {
        publish: "@object",
        subscribe: "object"
    });
    dm.define("PublishEvents", {
        toParent: "@object",
        toChildren: "object"
    });
    dm.define("SubscribeEvents", {
        forParent: "@object",
        forChildren: "object"
    });
    dm.define("Model", {
        define: "@object",
        observe: "object"
    });
    dm.define("ModelLevel", {
        global: "@object",
        own: "object"
    });
    dm.define("ModelDetail", {
        data: "@object",
        param: "object",
        event: "object",
        state: "object",
        command: "object"
    });
    dm.define("Ui", {
        socket: "@object",
        plug: "object"
    });
    dm.define("Description", {
        desc: "@string",
        param: "string",
        part: "string"
    });

    var fileIsNotExcluded = function (file, excludedFiles) {
        var result = true;
        excludedFiles.forEach(function (eachFile) {
            if (eachFile === file) {
                result = false;
            }
        });
        return result;
    };

    var checkObjValidity = function (obj) {
        var result = checkObjValidityAgainstClass(obj, "YAML", "top level");
        result += checkObjValidityAgainstClass(obj.interface, "Interface", "interface");
        if (obj.interface) {
            result += checkObjValidityAgainstClass(obj.interface.api, "Api", "api");
            result += checkObjValidityAgainstClass(obj.interface.events, "Events", "events");
            result += checkObjValidityAgainstClass(obj.interface.model, "Model", "model");
            result += checkObjValidityAgainstClass(obj.interface.ui, "Ui", "ui");

            if (obj.interface.api) {
                result += checkObjAttributesAgainstClass(obj.interface.api.register, "Description", "register");
                result += checkObjAttributesAgainstClass(obj.interface.api.call, "Description", "call");
            }
            if (obj.interface.events) {
                result += checkObjValidityAgainstClass(obj.interface.events.publish, "PublishEvents", "publish");
                result += checkObjValidityAgainstClass(obj.interface.events.subscribe, "SubscribeEvents", "subscribe");
                if (obj.interface.events.publish) {
                    result += checkObjAttributesAgainstClass(obj.interface.events.publish.toParent, "Description", "publish.toParent");
                    result += checkObjAttributesAgainstClass(obj.interface.events.publish.toChildren, "Description", "publish.toChildren");
                }
                if (obj.interface.events.subscribe) {
                    result += checkObjAttributesAgainstClass(obj.interface.events.subscribe.forParent, "Description", "subscribe.forParent");
                    result += checkObjAttributesAgainstClass(obj.interface.events.subscribe.forChildren, "Description", "subscribe.forChildren");
                }
            }
            if (obj.interface.model) {
                result += checkObjValidityAgainstClass(obj.interface.model.define, "ModelLevel", "define");
                result += checkObjValidityAgainstClass(obj.interface.model.observe, "ModelLevel", "observe");
                if (obj.interface.model.define) {
                    result += checkObjValidityAgainstClass(obj.interface.model.define.global, "ModelDetail", "define.global");
                    result += checkObjValidityAgainstClass(obj.interface.model.define.own, "ModelDetail", "define.own");
                    if (obj.interface.model.define.global) {
                        result += checkObjAttributesAgainstClass(obj.interface.model.define.global.data, "Description", "define.global.data");
                        result += checkObjAttributesAgainstClass(obj.interface.model.define.global.param, "Description", "define.global.param");
                        result += checkObjAttributesAgainstClass(obj.interface.model.define.global.state, "Description", "define.global.state");
                        result += checkObjAttributesAgainstClass(obj.interface.model.define.global.event, "Description", "define.global.event");
                        result += checkObjAttributesAgainstClass(obj.interface.model.define.global.command, "Description", "define.global.command");
                    }
                    if (obj.interface.model.define.own) {
                        result += checkObjAttributesAgainstClass(obj.interface.model.define.own.data, "Description", "define.own.data");
                        result += checkObjAttributesAgainstClass(obj.interface.model.define.own.param, "Description", "define.own.param");
                        result += checkObjAttributesAgainstClass(obj.interface.model.define.own.state, "Description", "define.own.state");
                        result += checkObjAttributesAgainstClass(obj.interface.model.define.own.event, "Description", "define.own.event");
                        result += checkObjAttributesAgainstClass(obj.interface.model.define.own.command, "Description", "define.own.command");
                    }
                }
                if (obj.interface.model.observe) {
                    result += checkObjValidityAgainstClass(obj.interface.model.observe.global, "ModelDetail", "observe.global");
                    result += checkObjValidityAgainstClass(obj.interface.model.observe.own, "ModelDetail", "observe.own");
                    if (obj.interface.model.observe.global) {
                        result += checkObjAttributesAgainstClass(obj.interface.model.observe.global.data, "Description", "observe.global.data");
                        result += checkObjAttributesAgainstClass(obj.interface.model.observe.global.param, "Description", "observe.global.param");
                        result += checkObjAttributesAgainstClass(obj.interface.model.observe.global.state, "Description", "observe.global.state");
                        result += checkObjAttributesAgainstClass(obj.interface.model.observe.global.event, "Description", "observe.global.event");
                        result += checkObjAttributesAgainstClass(obj.interface.model.observe.global.command, "Description", "observe.global.command");
                    }
                    if (obj.interface.model.observe.own) {
                        result += checkObjAttributesAgainstClass(obj.interface.model.observe.own.data, "Description", "observe.own.data");
                        result += checkObjAttributesAgainstClass(obj.interface.model.observe.own.param, "Description", "observe.own.param");
                        result += checkObjAttributesAgainstClass(obj.interface.model.observe.own.state, "Description", "observe.own.state");
                        result += checkObjAttributesAgainstClass(obj.interface.model.observe.own.event, "Description", "observe.own.event");
                        result += checkObjAttributesAgainstClass(obj.interface.model.observe.own.command, "Description", "observe.own.command");
                    }
                }
            }
            if (obj.interface.ui) {
                result += checkObjAttributesAgainstClass(obj.interface.ui.socket, "Description", "socket");
                result += checkObjAttributesAgainstClass(obj.interface.ui.plug, "Description", "plug");
            }
        }
        return result;
    };

    var checkObjValidityAgainstClass = function (obj, cls, level) {
        var result = "";
        if (obj !== undefined) {
            try {
                var entity = dm.create(cls, obj);
                dm.destroy(cls, entity, true);
            } catch (e) {
                result = "\nError on " + level + ": " + e.toString();
            }
        }
        return result;
    };

    var checkObjAttributesAgainstClass = function (obj, cls, level) {
        var result = "";
        if (obj !== undefined) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result += checkObjValidityAgainstClass(obj[key], cls, level + "." + key);
                }
            }
        }
        return result;
    };

    return function (options, tools) {
        var findings = [];

        //search for all js files in the given folder
        var files = glob.sync("**/component.yaml", {cwd: options.root});
        files.forEach(function (file) {
            var filename = path.join(options.root, file);
            if (fileIsNotExcluded(file, options.excludedFiles)) {
                // read in the file contents
                var contentYAML = fs.readFileSync(filename, {encoding: "utf8"});
                var contentObj = YAML.safeLoad(contentYAML);
                var message = checkObjValidity(contentObj);
                if (message)
                    findings.push({file: filename, text: message});
            }
        });
        return findings;
    }

}());