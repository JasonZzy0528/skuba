import { Select } from 'enquirer';
import { NormalizedReadResult } from 'read-pkg-up';

import { PROJECT_TYPES, ProjectType } from '../../utils/manifest';
import { TemplateConfig } from '../../utils/template';
import { hasProp } from '../../utils/validation';

interface Props {
  manifest: NormalizedReadResult;
  templateConfig: TemplateConfig;
}

export const getProjectType = async ({
  manifest,
  templateConfig,
}: Props): Promise<ProjectType> => {
  if (
    hasProp(manifest.packageJson.skuba, 'type') &&
    ProjectType.guard(manifest.packageJson.skuba.type)
  ) {
    return manifest.packageJson.skuba.type;
  }

  if (typeof templateConfig.type !== 'undefined') {
    return templateConfig.type;
  }

  const initial: ProjectType =
    manifest.packageJson.devDependencies?.['@seek/seek-module-toolkit'] ||
    manifest.packageJson.files
      ? 'package'
      : 'application';

  const projectTypePrompt = new Select({
    choices: PROJECT_TYPES,
    message: 'Project type:',
    name: 'projectType',
    initial,
  });

  return projectTypePrompt.run();
};