import { CommandModule } from 'yargs';
import Octokit, { Response } from '@octokit/rest';
import chalk from 'chalk';
import { existsSync } from 'fs';
import path from 'path';
import { executeTask } from '../helpers';
import fs from 'fs';

interface GithubItemContent {
  download_url: null;
  git_url: string;
  html_url: string;
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
  url: string;
}

enum ItemType {
  blob = 'blob',
  tree = 'tree'
}
interface GHTree {
  sha: string;
  url: string;
  tree: GHItem[];
}
interface GHItem {
  path: string;
  mode: string;
  type: ItemType;
  sha: string;
  url: string;
}

export function githubClient() {
  const octokit = new Octokit();

  const owner = 'emyann';
  const repo = 'matron';
  const templatesLocation = 'packages/templates/src/';
  return {
    async downloadTemplate(templateName: string, directory: string) {
      const templatesDirectory: Response<GithubItemContent[]> = await octokit.repos.getContents({
        owner,
        repo,
        path: templatesLocation
      });

      const templateDirectory = templatesDirectory.data.find(dir => dir.name === templateName);

      if (templateDirectory) {
        const result: Response<GHTree> = await octokit.git.getTree({
          owner,
          repo,
          tree_sha: templateDirectory.sha,
          recursive: 1
        });
        const rootDirectory = path.resolve(directory, templateName);
        if (!existsSync(rootDirectory)) {
          ensureDirectory(rootDirectory);
          const folders = result.data.tree.filter(item => item.type === ItemType.tree);
          const files = result.data.tree.filter(item => item.type === ItemType.blob);

          // console.log('folders', folders, files);
          folders.forEach(folder => {
            ensureDirectory(path.resolve(rootDirectory, folder.path));
          });
          const tasks = files.map(async item => {
            const blob = await octokit.git.getBlob({ owner, repo, file_sha: item.sha });
            const filePath = path.resolve(rootDirectory, item.path);
            fs.writeFileSync(filePath, Buffer.from(blob.data.content, 'base64').toString('utf8'));
          });
          return await Promise.all(tasks);
        }
      }
    },
    async listTemplates() {
      const result: Response<GithubItemContent[]> = await octokit.repos.getContents({
        owner,
        repo,
        path: templatesLocation
      });
      if (!result || !result.data) {
        return [];
      } else {
        return result.data.map(dir => dir.name);
      }
    }
  };
}

function ensureDirectory(directoryPath: string) {
  if (existsSync(directoryPath)) return;
  console.log(`creating directory ${directoryPath}`);
  return executeTask({ command: 'mkdir', args: ['-p', directoryPath] }, { stdio: [process.stdout] });
}

export const templates: CommandModule<TemplatesCommand, TemplatesCommand> = {
  command: 'templates [cmd]',
  describe: 'Templates',
  builder: {},
  handler: options => templatesCommand(options)
};

enum TemplatesSubCommand {
  list = 'list'
}
interface TemplatesCommand {
  cmd?: TemplatesSubCommand;
}
async function templatesCommand(options: TemplatesCommand) {
  switch (options.cmd) {
    case TemplatesSubCommand.list: {
      const templates = await githubClient().listTemplates();
      templates.forEach(template => {
        console.log(`- ${chalk.bold(template)}`);
      });
    }
    default:
      break;
  }
}
