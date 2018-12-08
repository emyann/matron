import { Tree, Rule } from '@angular-devkit/schematics';
/**
 * This method is specifically for reading JSON files in a Tree
 * @param host The host tree
 * @param path The path to the JSON file
 * @returns The JSON data in the file.
 */
export declare function readJsonInTree<T = any>(host: Tree, path: string): T;
/**
 * This method is specifically for updating JSON in a Tree
 * @param path Path of JSON file in the Tree
 * @param callback Manipulation of the JSON data
 * @returns A rule which updates a JSON file file in a Tree
 */
export declare function updateJsonInTree<T = any, O = T>(path: string, callback: (json: T) => O): Rule;
export declare function serializeJson(json: any): string;
