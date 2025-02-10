#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function decodeContent(str) {
  // Check if the content is an environment variable reference
  if (str.startsWith('$')) {
    const envVar = str.slice(1); // Remove the $ prefix
    const envValue = process.env[envVar];
    if (envValue === undefined) {
      throw new Error(`Error: Environment variable ${envVar} is not set`);
    }
    return envValue;
  }
  // Check if the content is a base64 encoded environment variable
  if (str.startsWith('base64:$')) {
    const envVar = str.replace('base64:$', ''); // Remove the base64:$ prefix
    const envValue = process.env[envVar];
    if (envValue === undefined) {
      throw new Error(`Error: Environment variable ${envVar} is not set`);
    }
    return Buffer.from(envValue, 'base64').toString('utf-8');
  }
  // Otherwise treat as base64 encoded content
  return Buffer.from(str, 'base64').toString('utf-8');
}

function parseWriteEnv() {
  const writeEnv = process.env.WRITE;
  if (!writeEnv) {
    throw new Error('Error: WRITE environment variable is not set');
  }

  // Split multiple write instructions by semicolon
  const writeInstructions = writeEnv.split(';').map(instruction => instruction.trim()).filter(Boolean);
  
  if (writeInstructions.length === 0) {
    throw new Error('Error: Invalid WRITE environment variable format');
  }

  return writeInstructions.map(instruction => {
    const match = instruction.match(/\[(.+?)\]\((.+?)\)/);
    if (!match) {
      throw new Error('Error: Invalid WRITE environment variable format');
    }

    return {
      filePath: match[1],
      content: decodeContent(match[2])
    };
  });
}

function writeToFile(filePath, content) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const directory = path.dirname(absolutePath);

    // Create directory if it doesn't exist
    fs.mkdirSync(directory, { recursive: true });

    // Write content to file
    fs.writeFileSync(absolutePath, content);
    console.log(`Successfully wrote content to ${filePath}`);
  } catch (error) {
    throw new Error(`Error writing to file: ${error.message}`);
  }
}

function main() {
  try {
    const writeInstructions = parseWriteEnv();
    for (const { filePath, content } of writeInstructions) {
      writeToFile(filePath, content);
    }
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  parseWriteEnv,
  writeToFile,
  decodeContent
};

// Only run main if this file is being run directly
if (require.main === module) {
  main();
}