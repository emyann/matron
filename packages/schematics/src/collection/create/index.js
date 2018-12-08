"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const spawn = require("cross-spawn");
const path = require("path");
const ast_utils_1 = require("../../helpers/ast-utils");
function create(options) {
    return (host, context) => {
        // console.log('options', options);
        const movePath = core_1.normalize('/' + core_1.strings.dasherize(options.name));
        const installTemplate = (template) => {
            console.log('installing template', template);
            const command = 'npm';
            const args = ['install', template, '--loglevel', 'error'];
            spawn.sync(command, args, { stdio: 'inherit', cwd: path.resolve(__dirname) });
        };
        const templateName = `@matron/${options.template}`;
        installTemplate(templateName);
        const templatePath = path.resolve(__dirname, '../../../node_modules', templateName);
        const template = schematics_1.apply(schematics_1.url(templatePath), [schematics_1.move(movePath)]);
        return schematics_1.chain([schematics_1.branchAndMerge(schematics_1.mergeWith(template)), updatePackageJson(options)])(host, context);
    };
}
exports.create = create;
function updatePackageJson(options) {
    return (_host, _context) => {
        const projectPath = core_1.normalize('/' + core_1.strings.dasherize(options.name));
        return ast_utils_1.updateJsonInTree(projectPath + '/package.json', json => {
            const { scripts, devDependencies, version, main, description } = json;
            return { scripts, devDependencies, version, main, description };
        });
    };
}
exports.updatePackageJson = updatePackageJson;
//# sourceMappingURL=index.js.map