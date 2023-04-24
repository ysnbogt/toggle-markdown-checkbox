import { prompt } from 'enquirer';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

type CheckBox = {
  index: number;
  checked: boolean;
  label: string;
};

interface PromptOptions {
  type: string;
  name: string;
  message: string;
  initial: number[];
  choices: {
    name: string;
    message: string;
  }[];
}

interface PromptResponse {
  checkboxes: string[];
}

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
