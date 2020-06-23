import ts from 'typescript';

import { assertDefined } from '../testing/module';

import {
  createPropAppender,
  createPropFilter,
  readModuleExports,
  transformModuleExports,
} from './typescript';

const JEST_CONFIG = `module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  preset: 'ts-jest',
  globalSetup: './jest.globalSetup.js',
  setupFilesAfterEnv: ['./jest.setup.js'],
};
`;

describe('transformModuleExports', () => {
  it('works with a no-op transformer', () => {
    const result = transformModuleExports(JEST_CONFIG, (props) => props);

    expect(result).toBe(JEST_CONFIG);
  });

  it('works with a prop appender', () => {
    const append = createPropAppender(
      ts.createNodeArray([
        ts.createPropertyAssignment(
          ts.createIdentifier('globalSetup'),
          ts.createStringLiteral('I should not take precedence'),
        ),
        ts.createPropertyAssignment(
          ts.createIdentifier('a'),
          ts.createStringLiteral('b'),
        ),
      ]),
    );

    const result = transformModuleExports(JEST_CONFIG, append);

    expect(result).toMatchInlineSnapshot(`
      "module.exports = {
        collectCoverage: true,
        coverageThreshold: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
          },
        },
        preset: 'ts-jest',
        globalSetup: './jest.globalSetup.js',
        setupFilesAfterEnv: ['./jest.setup.js'],
        a: 'b',
      };
      "
    `);
  });

  it('works with a prop filter', () => {
    const filter = createPropFilter([
      'coverageThreshold',
      'setupFilesAfterEnv',
      'globalSetup',
    ]);

    const result = transformModuleExports(JEST_CONFIG, filter);

    expect(result).toMatchInlineSnapshot(`
      "module.exports = {
        coverageThreshold: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
          },
        },
        globalSetup: './jest.globalSetup.js',
        setupFilesAfterEnv: ['./jest.setup.js'],
      };
      "
    `);
  });
});

describe('readModuleExports', () => {
  it('extracts props from a module.exports expression', () => {
    const result = readModuleExports(JEST_CONFIG);

    assertDefined(result);
    expect(result).toHaveLength(5);
    result.forEach((node) => expect(ts.isPropertyAssignment(node)).toBe(true));
  });
});