const path = require('path');
const { build } = require('esbuild');
const { esbuildDecorators } = require('@anatine/esbuild-decorators');
const fs = require('fs');

const optionalRequirePackages = [
  '@fastify/static',
  '@fastify/view',
  '@nestjs/microservices',
  '@nestjs/microservices/microservices-module',
  '@nestjs/platform-express',
  '@nestjs/websockets/socket-module',
  '@nestjs/websockets',
  'express',
  '@aws-sdk/client-dynamodb',
  '@aws-sdk/lib-dynamodb',
  'amqp-connection-manager',
  'amqplib',
  'cache-manager',
  'cache-manager/package.json',
  'class-transformer',
  'class-validator',
  'hbs',
  'ioredis',
  'kafkajs',
  'mqtt',
  'nats',
  'pg-hstore',
];

const workspacePackages = {
  '@nhl/env': path.resolve(__dirname, '../../packages/env/src'),
  '@nhl/error': path.resolve(__dirname, '../../packages/error/src'),
};

async function bundle() {
  fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });

  const result = await build({
    absWorkingDir: __dirname,
    entryPoints: ['src/main.ts'],
    outdir: 'dist',
    bundle: true,
    platform: 'node',
    target: 'node20',   // @nestjs/core@12 engines: node >= 20
    splitting: false,
    format: 'esm',
    outExtension: { '.js': '.mjs' },
    // esbuild rewrites CJS `require()` in ESM output to a __require shim that throws
    // "Dynamic require of X is not supported" unless a real `require` is already in
    // scope. Defining one here makes the shim resolve to the genuine require, so CJS
    // dependencies can load Node builtins (uuid -> crypto, sequelize, mysql2, ...).
    // __filename/__dirname are provided for the same interop reason.
    banner: {
      js: [
        "import { createRequire as __nodeCreateRequire } from 'node:module';",
        "import { fileURLToPath as __nodeFileURLToPath } from 'node:url';",
        "import { dirname as __nodeDirname } from 'node:path';",
        'const require = __nodeCreateRequire(import.meta.url);',
        'const __filename = __nodeFileURLToPath(import.meta.url);',
        'const __dirname = __nodeDirname(__filename);',
      ].join('\n'),
    },
    sourcemap: 'external',
    plugins: [
      {
        name: 'workspace-packages',
        setup(buildContext) {
          buildContext.onResolve(
            { filter: /^@nhl\/(env|error)(\/.*)?$/ },
            ({ path: importPath }) => {
              const packageName = importPath.match(/^@nhl\/(env|error)/)[0];
              const subpath = importPath
                .slice(packageName.length)
                .replace(/^\//, '');
              const packagePath = path.join(
                workspacePackages[packageName],
                subpath,
              );
              const filePath = `${packagePath}.ts`;
              return {
                path: subpath
                  ? fs.existsSync(filePath)
                    ? filePath
                    : path.join(packagePath, 'index.ts')
                  : path.join(workspacePackages[packageName], 'index.ts'),
              };
            },
          );
        },
      },
      esbuildDecorators({
        tsconfig: path.join(__dirname, 'tsconfig.json'),
        cwd: __dirname,
      }),
    ],
    external: optionalRequirePackages,
  });

  if (!result.errors.length) {
    console.log('Built successfully!');
    return;
  }

  console.error(result.errors[0]);
  process.exitCode = 1;
}

bundle().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
