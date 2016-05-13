"use strict";
var moment = require('moment');
var _ = require('lodash');
var util = require('util');

module.exports = (function () {
    var self = {};
    var registry = {};

    // store all marked objects in this array object
    self.objRegistry = {};

    self.hasObject = function (mark) {
        if (mark) {
            return self.objRegistry[mark] !== undefined;
        } else {
            return false;
        }
    };

    registry.addObject = function (obj) {
        if (obj && obj.mark) {
            if (!self.hasObject(obj.mark)) {
                self.objRegistry[obj.mark] = obj;
                delete obj.mark;
                return obj;
            } else {
                throw new Error("Object mark '" + obj.mark + "' is already registered");
            }
        } else {
            throw new Error('Given object has not attribute \'mark\'', obj);
        }
    };

    registry.removeObject = function (mark) {
        if (mark) {
            if (self.hasObject(mark)) {
                delete self.objRegistry[mark];
            } else {
                throw new Error("Object mark '" + mark + "' is not registered");
            }
        } else {
            throw new Error('No valid \'mark\' given', mark);
        }
    };

    registry.log = function (depth) {
        console.log(util.inspect(self.objRegistry, {depth: depth}));
    };

    registry.getObject = function (mark) {
        if (mark) {
            if (self.hasObject(mark)) {
                return self.objRegistry[mark];
            } else {
                throw new Error("Link to Object with mark '" + mark + "' not possible");
            }
        } else {
            throw new Error('No valid \'mark\' given', mark);
        }
    };

    registry.resolve = function (resultObj, obj, attrib) {
        if (obj && obj[attrib]) {
            if (Object.prototype.toString.call(obj[attrib]) === '[object Object]' && obj[attrib].objectRef) {
                resultObj[attrib] = registry.getObject(obj[attrib].objectRef);
            } else if (Object.prototype.toString.call(obj[attrib]) === '[object Array]') {
                resultObj[attrib] = [];
                obj[attrib].forEach(function (each) {
                    if (Object.prototype.toString.call(each) === '[object Object]' && each.objectRef) {
                        resultObj[attrib].push(registry.getObject(each.objectRef));
                    } else {
                        resultObj[attrib].push(each);
                    }
                });
            } else {
                resultObj[attrib] = obj[attrib];
            }
        }
    };

    return {registry: registry};
})();