import { Rule } from '@angular-devkit/schematics';
interface Schema {
    name: string;
    template: string;
}
export declare function create(options: Schema): Rule;
export declare function updatePackageJson(options: Schema): Rule;
export {};
