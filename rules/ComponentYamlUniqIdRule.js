var glob = require("glob")
var path = require("path")
var fs = require("fs")
var YAML = require("js-yaml")
var _ = require("lodash")
require("colors")

module.exports = (function () {

    var fileIsNotExcluded = function (file, excludedFiles) {
        var result = true
        excludedFiles.forEach(function (eachFile) {
            if (eachFile === file) {
                result = false
            }
        })
        return result
    }

    return function (options) {
        var findings = []

        var files = glob.sync("**/component.yaml", {cwd: options.root})

        var collectedIds = {}

        files.forEach(function (file) {
            var filename = path.join(options.root, file)
            if (fileIsNotExcluded(file, options.excludedFiles)) {
                // read in the file contents
                var contentYAML = fs.readFileSync(filename, {encoding: "utf8"})
                var contentObj = YAML.safeLoad(contentYAML)
                if (collectedIds.hasOwnProperty(contentObj.id)) {
                    findings.push({
                        file: file,
                        text: "Duplicate Id found: ".white + contentObj.id.yellow.bold + " - Ensure that the id of a component.yaml file is unique.".gray
                    })
                } else {
                    collectedIds[contentObj.id] = {
                        obj: contentObj,
                        file: file
                    }
                }
            }
        })

        return findings
    }
}())
