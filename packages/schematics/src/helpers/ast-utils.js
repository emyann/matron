"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stripJsonComments = require("strip-json-comments");
/**
 * This method is specifically for reading JSON files in a Tree
 * @param host The host tree
 * @param path The path to the JSON file
 * @returns The JSON data in the file.
 */
function readJsonInTree(host, path) {
    if (!host.exists(path)) {
        throw new Error(`Cannot find ${path}`);
    }
    return JSON.parse(stripJsonComments(host.read(path).toString('utf-8')));
}
exports.readJsonInTree = readJsonInTree;
/**
 * This method is specifically for updating JSON in a Tree
 * @param path Path of JSON file in the Tree
 * @param callback Manipulation of the JSON data
 * @returns A rule which updates a JSON file file in a Tree
 */
function updateJsonInTree(path, callback) {
    return (host) => {
        host.overwrite(path, serializeJson(callback(readJsonInTree(host, path))));
        return host;
    };
}
exports.updateJsonInTree = updateJsonInTree;
function serializeJson(json) {
    return `${JSON.stringify(json, null, 2)}\n`;
}
exports.serializeJson = serializeJson;
//# sourceMappingURL=ast-utils.js.map