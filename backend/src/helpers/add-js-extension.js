import fs from "fs";
import inquirer from "inquirer";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Get the current file path and its directory for path resolution.
 *
 * @dev This is used to resolve the paths relative to the script's location.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * The source directory where all the TypeScript files are located.
 *
 * @dev This is where the files will be searched to add or revert the .js extension.
 */
const srcDir = path.join(__dirname, "../../src");

/**
 * Check if a module is a node module using require.resolve.
 *
 * @param {string} moduleName - The name of the module to check.
 * @returns {boolean} - True if it's a node module, false otherwise.
 */
const isNodeModule = (moduleName) => {
  const require = createRequire(import.meta.url);
  try {
    require.resolve(moduleName);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Recursively find all TypeScript (.ts) files in the given directory.
 *
 * @param {string} dir - The directory to search within.
 * @returns {string[]} - Array of file paths of all found .ts files.
 */
const findFiles = (dir) => {
  const files = fs.readdirSync(dir);
  let allFiles = [];

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      allFiles = [...allFiles, ...findFiles(filePath)];
    } else if (filePath.endsWith(".ts")) {
      allFiles.push(filePath);
    }
  });

  return allFiles;
};

/**
 * Add .js extension to import statements in a file.
 *
 * @param {string} filePath - The path to the file to modify.
 */
const addJsExtensionToImports = (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  const regex = /from\s+['"](.+?)['"]/g;

  content = content.replace(regex, (match, group) => {
    // Only add .js if it's not a node module and does not already have .js
    if (!isNodeModule(group) && !group.endsWith(".js") && !group.includes("node_modules")) {
      return match.replace(group, `${group}.js`);
    }
    return match;
  });

  fs.writeFileSync(filePath, content, "utf8");
};

/**
 * Revert .js extension in import statements in a file.
 *
 * @param {string} filePath - The path to the file to modify.
 */
const revertJsExtensionInImports = (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  const regex = /from\s+['"](.+?)\.js['"]/g;

  content = content.replace(regex, (match, group) => {
    return match.replace(".js", "");
  });

  fs.writeFileSync(filePath, content, "utf8");
};

/**
 * Prompt the user to choose whether to add or revert .js extensions in imports.
 */
const handleUserChoice = async () => {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: ["Add .js extensions to imports", "Revert .js extensions from imports"],
    },
  ]);

  const tsFiles = findFiles(srcDir);

  if (action === "Add .js extensions to imports") {
    tsFiles.forEach(addJsExtensionToImports);
    console.log(".js extensions added to imports in /src.");
  } else {
    tsFiles.forEach(revertJsExtensionInImports);
    console.log(".js extensions reverted from imports in /src.");
  }
};

handleUserChoice();
