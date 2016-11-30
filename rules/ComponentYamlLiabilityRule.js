var glob = require("glob")
var path = require("path")
var fs = require("fs")
var YAML = require("js-yaml")
var _ = require("lodash")
require("colors")

module.exports = (function () {

    var checkLiability = function (options, tools, yamlFilename, content) {
        var findings = []
        var dirname = path.dirname(yamlFilename)
        var ctrlAstList = tools.astJS.findAstList(dirname, options.ctrlFiles || "+(*-ctrl.js|*-services.js)", options.excludedFiles)
        var modelAstList = tools.astJS.findAstList(dirname, options.modelFiles || "*-model.js", options.excludedFiles)
        var viewAstList = tools.astJS.findAstList(dirname, options.viewFiles || "*-view.js", options.excludedFiles)

        findings = findings.concat(checkLiabilityForRegisterAPI(options, tools, yamlFilename, content, ctrlAstList))
        findings = findings.concat(checkLiabilityForCallAPI(options, tools, yamlFilename, content, ctrlAstList))
        findings = findings.concat(checkLiabilityForPublishEvents(options, tools, yamlFilename, content, ctrlAstList))
        findings = findings.concat(checkLiabilityForSubscribeEvents(options, tools, yamlFilename, content, ctrlAstList))
        findings = findings.concat(checkLiabilityForModelDefinition(options, tools, yamlFilename, content, modelAstList))
        findings = findings.concat(checkLiabilityForModelObserver(options, tools, yamlFilename, content, ctrlAstList, viewAstList))
        findings = findings.concat(checkLiabilityForUI(options, tools, yamlFilename, content, viewAstList))
        return findings
    }

    var checkLiabilityForRegisterAPI = function (options, tools, yamlFilename, content, ctrlAstList) {
        var findings = []

        var yamlRegisters = []
        if (content && content.interface && content.interface.api) {
            if (content.interface.api.register) {
                for (var key in content.interface.api.register) {
                    yamlRegisters.push({name: key, file: yamlFilename})
                }
            }
        }
        yamlRegisters = _.uniqBy(yamlRegisters, 'name')

        var registerQueries = options.registerQueries || [{name: 'registerAPI', argument: 0}, {name: 'registerService', argument: 1}]

        var ctrlRegisters = []
        ctrlAstList.forEach(function (astObj) {
            var registerAstList;
            registerQueries.forEach(function (registerQuery) {
                registerAstList = tools.astJS.astq.query(astObj.ast, "//CallExpression [ /MemberExpression /Identifier [@name == '" + registerQuery.name + "']]")
                registerAstList.forEach(function (eachRegisterAst) {
                    if (eachRegisterAst.arguments && eachRegisterAst.arguments[registerQuery.argument].type === "Literal") {
                        ctrlRegisters.push({name: eachRegisterAst.arguments[registerQuery.argument].value, type: registerQuery.name, file: astObj.file})
                    }
                })
            })
        })
        ctrlRegisters = _.uniqBy(ctrlRegisters, 'name')

        _.forEach(yamlRegisters.concat(), function (yamlRegister) {
            var foundCtrlRegister = _.find(ctrlRegisters, function (ctrlRegister) {
                return (ctrlRegister.name === yamlRegister.name)
            })
            if (foundCtrlRegister) {
                yamlRegisters = _.without(yamlRegisters, yamlRegister)
                ctrlRegisters = _.without(ctrlRegisters, foundCtrlRegister)
            }
        })

        // Remaining Entries result in a finding
        _.forEach(yamlRegisters, function (yamlRegister) {
            findings.push({
                file: yamlRegister.file,
                text: "found ".gray + "registerAPI".white.bold + "(".gray + yamlRegister.name.yellow.bold + ") - but it is not defined in the ".gray + "ctrl".yellow.bold
            })
        })
        _.forEach(ctrlRegisters, function (ctrlRegister) {
            findings.push({
                file: ctrlRegister.file,
                text: "found ".gray + ctrlRegister.type.white.bold + "(".gray + ctrlRegister.name.yellow.bold + ") - but it is not documented in the ".gray + "component.yaml".yellow.bold
            })
        })

        return findings
    }

    var checkLiabilityForCallAPI = function (options, tools, yamlFilename, content, ctrlAstList) {
        var findings = []

        var yamlCalls = []
        if (content && content.interface && content.interface.api) {
            if (content.interface.api.call) {
                for (var key in content.interface.api.call) {
                    yamlCalls.push({name: key, file: yamlFilename})
                }
            }
        }
        yamlCalls = _.uniqBy(yamlCalls, 'name')

        var ctrlCalls = []
        ctrlAstList.forEach(function (astObj) {
            var callAstList = tools.astJS.astq.query(astObj.ast, "//CallExpression [ /MemberExpression /Identifier [@name == 'call']]")
            callAstList.forEach(function (eachCallAst) {
                if (eachCallAst.arguments && eachCallAst.arguments[0].type === "Literal") {
                    ctrlCalls.push({name: eachCallAst.arguments[0].value, file: astObj.file})
                }
            })
        })
        ctrlCalls = _.uniqBy(ctrlCalls, 'name')

        _.forEach(yamlCalls.concat(), function (yamlCall) {
            var foundCtrlCall = _.find(ctrlCalls, function (ctrlCall) {
                return (ctrlCall.name === yamlCall.name) ||
                    (ctrlCall.type === "default" && yamlCall.type === "default")
            })
            if (foundCtrlCall) {
                yamlCalls = _.without(yamlCalls, yamlCall)
                ctrlCalls = _.without(ctrlCalls, foundCtrlCall)
            }
        })

        // Remaining Entries result in a finding
        _.forEach(yamlCalls, function (yamlCall) {
            findings.push({
                file: yamlCall.file,
                text: "found ".gray + "call".white.bold + "(".gray + yamlCall.name.yellow.bold + ") - but it is not defined in the ".gray + "ctrl".yellow.bold
            })
        })
        _.forEach(ctrlCalls, function (ctrlCall) {
            findings.push({
                file: ctrlCall.file,
                text: "found ".gray + "call".white.bold + "(".gray + ctrlCall.name.yellow.bold + ") - but it is not documented in the ".gray + "component.yaml".yellow.bold
            })
        })

        return findings
    }

    var checkLiabilityForPublishEvents = function (options, tools, yamlFilename, content, ctrlAstList) {
        var findings = []

        var yamlPublishs = []
        if (content && content.interface && content.interface.events && content.interface.events.publish) {
            if (content.interface.events.publish.toParent) {
                for (var key in content.interface.events.publish.toParent) {
                    yamlPublishs.push({name: key, file: yamlFilename, type: 'publishEventToParent'})
                }
            }
            if (content.interface.events.publish.toChildren) {
                for (var key in content.interface.events.publish.toChildren) {
                    yamlPublishs.push({name: key, file: yamlFilename, type: 'publishEventToChildren'})
                }
            }
        }
        yamlPublishs = _.uniqBy(yamlPublishs, function(finding) { return finding.name + finding.type })

        var ctrlPublishs = []
        ctrlAstList.forEach(function (astObj) {
            var publishAstList = tools.astJS.astq.query(astObj.ast, "//CallExpression [ /MemberExpression /Identifier [@name == 'publishEventToParent']]")
            publishAstList.forEach(function (eachPublishAst) {
                if (eachPublishAst.arguments && eachPublishAst.arguments[0].type === "Literal") {
                    ctrlPublishs.push({name: eachPublishAst.arguments[0].value, type: "publishEventToParent", file: astObj.file})
                }
            })
            publishAstList = tools.astJS.astq.query(astObj.ast, "//CallExpression [ /MemberExpression /Identifier [@name == 'publishEventToChildren']]")
            publishAstList.forEach(function (eachPublishAst) {
                if (eachPublishAst.arguments && eachPublishAst.arguments[1].type === "Literal") {
                    ctrlPublishs.push({name: eachPublishAst.arguments[1].value, type: "publishEventToChildren", file: astObj.file})
                }
            })
        })
        ctrlPublishs = _.uniqBy(ctrlPublishs, function(finding) { return finding.name + finding.type })

        _.forEach(yamlPublishs.concat(), function (yamlPublish) {
            var foundCtrlPublish = _.find(ctrlPublishs, function (ctrlPublish) {
                return (ctrlPublish.name === yamlPublish.name && ctrlPublish.type === yamlPublish.type)
            })
            if (foundCtrlPublish) {
                yamlPublishs = _.without(yamlPublishs, yamlPublish)
                ctrlPublishs = _.without(ctrlPublishs, foundCtrlPublish)
            }
        })

        // Remaining Entries result in a finding
        _.forEach(yamlPublishs, function (yamlPublish) {
            findings.push({
                file: yamlPublish.file,
                text: "found ".gray + yamlPublish.type.white.bold + "(".gray + yamlPublish.name.yellow.bold + ") - but it is not defined in the ".gray + "ctrl".yellow.bold
            })
        })
        _.forEach(ctrlPublishs, function (ctrlPublish) {
            findings.push({
                file: ctrlPublish.file,
                text: "found ".gray + ctrlPublish.type.white.bold + "(".gray + ctrlPublish.name.yellow.bold + ") - but it is not documented in the ".gray + "component.yaml".yellow.bold
            })
        })

        return findings
    }

    var checkLiabilityForSubscribeEvents = function (options, tools, yamlFilename, content, ctrlAstList) {
        var findings = []

        var yamlSubscribers = []
        if (content && content.interface && content.interface.events && content.interface.events.subscribe) {
            if (content.interface.events.subscribe.forParent) {
                for (var key in content.interface.events.subscribe.forParent) {
                    yamlSubscribers.push({name: key, file: yamlFilename, type: "subscribeForParentEvent"})
                }
            }
            if (content.interface.events.subscribe.forChildren) {
                for (var key in content.interface.events.subscribe.forChildren) {
                    yamlSubscribers.push({name: key, file: yamlFilename, type: "subscribeForChildEvent"})
                }
            }
        }
        yamlSubscribers = _.uniqBy(yamlSubscribers, function(finding) { return finding.name + finding.type })

        var ctrlSubscribers = []
        ctrlAstList.forEach(function (astObj) {
            var subscribeAstList = tools.astJS.astq.query(astObj.ast, "//CallExpression [ /MemberExpression /Identifier [@name == 'subscribeForParentEvent']] /Literal")
            subscribeAstList.forEach(function (eachSubscribeAst) {
                if (eachSubscribeAst.value) {
                    ctrlSubscribers.push({name: eachSubscribeAst.value, type: "subscribeForParentEvent", file: astObj.file})
                }
            })
            subscribeAstList = tools.astJS.astq.query(astObj.ast, "//CallExpression [ /MemberExpression /Identifier [@name == 'subscribeForChildEvent']] /Literal")
            subscribeAstList.forEach(function (eachSubscribeAst) {
                if (eachSubscribeAst.value) {
                    ctrlSubscribers.push({name: eachSubscribeAst.value, type: "subscribeForChildEvent", file: astObj.file})
                }
            })
        })
        ctrlSubscribers = _.uniqBy(ctrlSubscribers, function(finding) { return finding.name + finding.type })

        _.forEach(yamlSubscribers.concat(), function (yamlSubscribe) {
            var foundCtrlSubscribe = _.find(ctrlSubscribers, function (ctrlSubscribe) {
                return (ctrlSubscribe.name === yamlSubscribe.name && ctrlSubscribe.type === yamlSubscribe.type)
            })
            if (foundCtrlSubscribe) {
                yamlSubscribers = _.without(yamlSubscribers, yamlSubscribe)
                ctrlSubscribers = _.without(ctrlSubscribers, foundCtrlSubscribe)
            }
        })

        // Remaining Entries result in a finding
        _.forEach(yamlSubscribers, function (yamlSubscribe) {
            findings.push({
                file: yamlSubscribe.file,
                text: "found ".gray + yamlSubscribe.type.white.bold + "(".gray + yamlSubscribe.name.yellow.bold + ") - but it is not defined in the ".gray + "ctrl".yellow.bold
            })
        })
        _.forEach(ctrlSubscribers, function (ctrlSubscribe) {
            findings.push({
                file: ctrlSubscribe.file,
                text: "found ".gray + ctrlSubscribe.type.white.bold + "(".gray + ctrlSubscribe.name.yellow.bold + ") - but it is not documented in the ".gray + "component.yaml".yellow.bold
            })
        })

        return findings
    }

    var checkLiabilityForModelDefinition = function (options, tools, yamlFilename, content, modelAstList) {
        var findings = []

        var yamlModelFields = []
        if (content && content.interface && content.interface.model && content.interface.model.define) {
            for (var ownOrGlobal in content.interface.model.define) {
                var define = content.interface.model.define[ownOrGlobal]
                for (var fieldType in define) {
                    var fields = define[fieldType]
                    for (var field in fields) {
                        var fieldname = (ownOrGlobal === "own" ? "" : ownOrGlobal + ":") + fieldType + ":" + field
                        yamlModelFields.push({name: fieldname, file: yamlFilename})
                    }
                }
            }
        }

        var modelFields = []
        modelAstList.forEach(function (astObj) {
            var modelDefinitionAstList = tools.astJS.astq.query(astObj.ast, "//CallExpression [ /MemberExpression /Identifier [@name == 'model']]")
            modelDefinitionAstList.forEach(function (modelDefinitionAst) {
                var modelFieldsAstList = tools.astJS.astq.query(modelDefinitionAst, "/ObjectExpression /Property /Literal")
                modelFieldsAstList.forEach(function (modelFieldAst) {
                    modelFields.push({name: modelFieldAst.value, file: astObj.file})
                })
            })

        })

        _.forEach(yamlModelFields.concat(), function (yamlModelField) {
            var foundModelField = _.find(modelFields, function (modelField) {
                return (modelField.name === yamlModelField.name)
            })
            if (foundModelField) {
                yamlModelFields = _.without(yamlModelFields, yamlModelField)
                modelFields = _.without(modelFields, foundModelField)
            }
        })

        // Remaining Entries result in a finding
        _.forEach(yamlModelFields, function (yamlModelField) {
            findings.push({
                file: yamlModelField.file,
                text: "found ".gray + "model field".white.bold + "(".gray + yamlModelField.name.yellow.bold + ") - but it is not defined in the ".gray + "model".yellow.bold
            })
        })
        _.forEach(modelFields, function (modelField) {
            findings.push({
                file: modelField.file,
                text: "found ".gray + "model field".white.bold + "(".gray + modelField.name.yellow.bold + ") - but it is not documented in the ".gray + "component.yaml".yellow.bold
            })
        })

        return findings
    }

    var checkLiabilityForModelObserver = function (options, tools, yamlFilename, content, ctrlAstList, viewAstList) {
        var findings = []

        var yamlModelObservers = []
        var yamlModelObserverMissingParts = []
        if (content && content.interface && content.interface.model && content.interface.model.observe) {
            var regexpCtrl = /controller/i
            var regexpView = /view/i
            for (var ownOrGlobal in content.interface.model.observe) {
                var observe = content.interface.model.observe[ownOrGlobal]
                for (var fieldType in observe) {
                    var fields = observe[fieldType]
                    for (var field in fields) {
                        var fieldname = (ownOrGlobal === "own" ? "" : ownOrGlobal + ":") + fieldType + ":" + field
                        var part = fields[field].part
                        if (!part) {
                            yamlModelObserverMissingParts.push({name: fieldname, file: yamlFilename})
                        } else {
                            if (part.match(regexpCtrl)) {
                                yamlModelObservers.push({name: fieldname, file: yamlFilename, type: "Controller"})
                            }
                            if (part.match(regexpView)) {
                                yamlModelObservers.push({name: fieldname, file: yamlFilename , type: "View"})
                            }
                        }
                    }
                }
            }
        }

        var modelObservers = []
        ctrlAstList.forEach(function (astObj) {
            var modelObserverAstList = tools.astJS.astq.query(astObj.ast, "//CallExpression [ //MemberExpression //Identifier [ @name == 'observeOwnModel' | @name == 'observeParentModel' ]]")
            modelObserverAstList.forEach(function (ctrlObserverAst) {
                var astList = tools.astJS.astq.query(ctrlObserverAst, "/Literal")
                astList.forEach(function (ast) {
                    modelObservers.push({name: ast.value, file: astObj.file, type: "Controller"})
                })
            })
        })

        viewAstList.forEach(function (astObj) {
            var modelObserverAstList = tools.astJS.astq.query(astObj.ast, "//CallExpression [ //MemberExpression //Identifier [ @name == 'observeOwnModel' | @name == 'observeParentModel' ]]")
            modelObserverAstList.forEach(function (viewObserverAst) {
                var astList = tools.astJS.astq.query(viewObserverAst, "/Literal")
                astList.forEach(function (ast) {
                    modelObservers.push({name: ast.value, file: astObj.file, type: "View"})
                })
            })
        })

        _.forEach(yamlModelObservers.concat(), function (yamlModelObserver) {
            var foundCtrlObserver = _.find(modelObservers, function (observer) {
                return (observer.name === yamlModelObserver.name && observer.type === yamlModelObserver.type)
            })
            if (foundCtrlObserver) {
                yamlModelObservers = _.without(yamlModelObservers, yamlModelObserver)
                modelObservers = _.without(modelObservers, foundCtrlObserver)
            }
        })

        _.forEach(yamlModelObserverMissingParts, function (missingPart) {
            findings.push({
                file: missingPart.file,
                text: "found ".gray + "observer ".white.bold + "(".gray + missingPart.name.yellow.bold + ") in the " + "component.yaml".white.bold + " - but the attribute " + "part".yellow.bold + " is not documented in the ".gray + "component.yaml".yellow.bold
            })
        })

        // Remaining Entries result in a finding
        _.forEach(yamlModelObservers, function (yamlModelObserver) {
            findings.push({
                file: yamlModelObserver.file,
                text: "found ".gray + "observer ".white.bold + "(".gray + yamlModelObserver.name.yellow.bold + ") in the " + "component.yaml".white.bold + " - but it is not observed in the ".gray + yamlModelObserver.type.yellow.bold
            })
        })
        _.forEach(modelObservers, function (modelObserver) {
            findings.push({
                file: modelObserver.file,
                text: "found ".gray + "observer ".white.bold + "(".gray + modelObserver.name.yellow.bold + ") in the " + modelObserver.type.white.bold + " - but it is not documented in the ".gray + "component.yaml".yellow.bold
            })
        })

        return findings
    }

    var checkLiabilityForUI = function (options, tools, yamlFilename, content, viewAstList) {
        var findings = []

        var yamlSockets = []
        var yamlPlugs = []
        if (content && content.interface && content.interface.ui) {
            var key
            if (content.interface.ui.plug) {
                for (key in content.interface.ui.plug) {
                    var plugName = key
                    var plugType = (content.interface.ui.plug[key].part || "default").toLowerCase()
                    yamlPlugs.push({name: plugName, type: plugType, file: yamlFilename})
                }
            }
            if (content.interface.ui.socket) {
                for (key in content.interface.ui.socket) {
                    var socketName = key
                    var socketType = (content.interface.ui.socket[key].part || "default").toLowerCase()
                    yamlSockets.push({name: socketName, type: socketType, file: yamlFilename})
                }
            }
        }

        var viewSockets = []
        var viewPlugs = []
        viewAstList.forEach(function (astObj) {
            var socketsAstList = tools.astJS.astq.query(astObj.ast, "//CallExpression [ /MemberExpression /Identifier [@name == 'socket']]")
            socketsAstList.forEach(function (eachSocketAst) {
                if (eachSocketAst.arguments && eachSocketAst.arguments[0].type === "ObjectExpression") {
                    var scope, name
                    eachSocketAst.arguments[0].properties.forEach(function (prop) {
                        if (prop.key.name === "scope")
                            scope = prop.value.value
                        if (prop.key.name === "name")
                            name = prop.value.value
                    })
                    var socketName = name || scope || "default"
                    var socketType = name ? "name" : scope ? "scope" : "default"
                    viewSockets.push({name: socketName, type: socketType, file: astObj.file})
                }
            })
            var plugAstList = tools.astJS.astq.query(astObj.ast, "//CallExpression [ /MemberExpression /Identifier [@name == 'plug']]")
            plugAstList.forEach(function (eachPlugAst) {
                if (eachPlugAst.arguments && eachPlugAst.arguments[0].type === "ObjectExpression") {
                    var name
                    eachPlugAst.arguments[0].properties.forEach(function (prop) {
                        if (prop.key.name === "name") {
                            if (prop.value.type === "Literal")
                                name = prop.value.value
                            if (prop.value.type === "MemberExpression")
                                name = prop.value.property.name
                            if (prop.value.type === "CallExpression")
                                name = prop.value.arguments[0].value
                        }
                    })
                    var plugName = name || "default"
                    var plugType = name ? "name" : "default"
                    viewPlugs.push({name: plugName, type: plugType, file: astObj.file})
                }
            })
        })

        _.forEach(yamlSockets.concat(), function (yamlSocket) {
            var foundViewSocket = _.find(viewSockets, function (viewSocket) {
                return (viewSocket.name === yamlSocket.name && viewSocket.type === yamlSocket.type) ||
                    (viewSocket.type === "default" && yamlSocket.type === "default")
            })
            if (foundViewSocket) {
                yamlSockets = _.without(yamlSockets, yamlSocket)
                viewSockets = _.without(viewSockets, foundViewSocket)
            }
        })

        // Remaining Entries result in a finding
        _.forEach(yamlSockets, function (yamlSocket) {
            findings.push({
                file: yamlSocket.file,
                text: "found ".gray + "socket".white.bold + "(".gray + yamlSocket.name.yellow.bold + ") of type(".gray + yamlSocket.type.yellow.bold + ") - but it is not defined in the ".gray + "view".yellow.bold
            })
        })
        _.forEach(viewSockets, function (viewSocket) {
            findings.push({
                file: viewSocket.file,
                text: "found ".gray + "socket".white.bold + "(".gray + viewSocket.name.yellow.bold + ") of type(".gray + viewSocket.type.yellow.bold + ") - but it is not documented in the ".gray + "component.yaml".yellow.bold
            })
        })


        _.forEach(yamlPlugs.concat(), function (yamlPlug) {
            var foundViewPlug = _.find(viewPlugs, function (viewPlug) {
                return (viewPlug.name === yamlPlug.name && viewPlug.type === yamlPlug.type) ||
                    (viewPlug.type === "default" && yamlPlug.type === "default")
            })
            if (foundViewPlug) {
                yamlPlugs = _.without(yamlPlugs, yamlPlug)
                viewPlugs = _.without(viewPlugs, foundViewPlug)
            }
        })

        // Remaining Entries result in a finding
        _.forEach(yamlPlugs, function (yamlPlug) {
            findings.push({
                file: yamlPlug.file,
                text: "found ".gray + "plug".white.bold + "(".gray + yamlPlug.name.yellow.bold + ") of type(".gray + yamlPlug.type.yellow.bold + ") - but it is not defined in the ".gray + "view".yellow.bold
            })
        })
        _.forEach(viewPlugs, function (viewPlug) {
            findings.push({
                file: viewPlug.file,
                text: "found ".gray + "plug".white.bold + "(".gray + viewPlug.name.yellow.bold + ") of type(".gray + viewPlug.type.yellow.bold + ") - but it is not documented in the ".gray + "component.yaml".yellow.bold
            })
        })

        return findings
    }

    var fileIsNotExcluded = function (file, excludedFiles) {
        var result = true
        excludedFiles.forEach(function (eachFile) {
            if (eachFile === file) {
                result = false
            }
        })
        return result
    }

    return function (options, tools) {
        var findings = []

        var files = glob.sync("**/component.yaml", {cwd: options.root})
        files.forEach(function (file) {
            var filename = path.join(options.root, file)
            if (fileIsNotExcluded(file, options.excludedFiles)) {
                // read in the file contents
                var contentYAML = fs.readFileSync(filename, {encoding: "utf8"})
                var contentObj = YAML.safeLoad(contentYAML)

                findings = findings.concat(checkLiability(options, tools, filename, contentObj))
            }
        })

        return findings
    }

}())