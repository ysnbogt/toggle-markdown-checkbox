import { prompt } from 'enquirer';
import { resolve } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

type CheckBox = {
  index: number;
  checked: boolean;
  label: string;
};

type PromptOptions = {
  type: string;
  name: string;
  message: string;
  initial: number[];
  choices: {
    name: string;
    message: string;
  }[];
};

type PromptResponse = {
  checkboxes: string[];
};

function updateCheckboxesState(
  checkboxes: CheckBox[],
  selectedIndices: number[]
): void {
  checkboxes.forEach((_, index) => {
    if (selectedIndices.includes(index)) {
      checkboxes[index].checked = true;
      return;
    }
    checkboxes[index].checked = false;
  });
}

function updateFileContent(
  fileName: string,
  fileContent: string,
  checkboxes: CheckBox[]
): void {
  let updatedContent = fileContent;
  checkboxes.forEach(({ checked, label, index }) => {
    const newCheckbox = `- [${checked ? 'x' : ' '}]${label}`;
    updatedContent =
      updatedContent.substring(0, index) +
      newCheckbox +
      updatedContent.substring(index + newCheckbox.length);
  });

  writeFileSync(fileName, updatedContent, 'utf-8');
  console.log('File updated successfully.');
}

async function main() {
  const fileName = resolve(process.argv[2]);

  if (!existsSync(fileName)) {
    console.error(`\x1b[31mError:\x1b[0m File '${fileName}' does not exist.`);
    process.exit(1);
  }

  const fileContent = readFileSync(fileName, 'utf-8');
  const regex = /^- \[(x| )\](.*)$/gm;
  let match;
  const checkboxes: CheckBox[] = [];

  while ((match = regex.exec(fileContent)) !== null) {
    checkboxes.push({
      index: match.index,
      checked: match[1] === 'x',
      label: match[2],
    });
  }

  if (checkboxes.length === 0) {
    console.error(
      `\x1b[31mError:\x1b[0m No matching content found in '${fileName}'.`
    );
    process.exit(1);
  }

  const initial = checkboxes
    .map((checkbox, index) => checkbox.checked && index)
    .filter(value => value !== false) as number[];

  await prompt({
    type: 'multiselect',
    name: 'checkboxes',
    message: 'Select items to toggle',
    initial,
    choices: checkboxes.map((checkbox, index) => ({
      name: index.toString(),
      message: checkbox.label,
    })),
  } as PromptOptions)
    .then((response: unknown) => {
      const selectedIndices: number[] = (
        response as PromptResponse
      ).checkboxes.map((selected: string) => Number(selected));

      updateCheckboxesState(checkboxes, selectedIndices);
      updateFileContent(fileName, fileContent, checkboxes);
    })
    .catch((error: Error) => {
      console.error('Error:', error);
    });
}

main();
