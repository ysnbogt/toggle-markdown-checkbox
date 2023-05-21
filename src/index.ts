import { prompt } from 'enquirer';
import { resolve } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import frontMatter from 'front-matter';
import chalk, { type ColorName } from 'chalk';

type CheckBox = {
  index: number;
  checked: boolean;
  label: string;
  extraLabel: string;
  due: Date | undefined;
};

type Colors = Record<string, ColorName>;

type FileContent = {
  content: string;
  checkboxes: CheckBox[];
  attributes: Colors;
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

function reportCheckboxState(checkboxes: CheckBox[]): void {
  const totalCheckboxes = checkboxes.length;
  const checkedCheckboxes = checkboxes.filter(cb => cb.checked).length;
  const completionRateStr = (
    (checkedCheckboxes / totalCheckboxes) *
    100
  ).toFixed(2);
  const completionRate = parseFloat(completionRateStr);

  console.log(
    `\nCheckbox State Report: ${checkedCheckboxes}/${totalCheckboxes} checkboxes checked.\n`
  );

  if (completionRate < 50) {
    console.log(`\x1b[31mCompletion Rate: ${completionRate}%\x1b[0m\n`);
  } else if (completionRate < 75) {
    console.log(`\x1b[33mCompletion Rate: ${completionRate}%\x1b[0m\n`);
  } else {
    console.log(`\x1b[32mCompletion Rate: ${completionRate}%\x1b[0m\n`);
  }
}

function updateFileContent(
  fileName: string,
  fileContent: string,
  checkboxes: CheckBox[]
): void {
  let updatedContent = fileContent;
  checkboxes.forEach(({ checked, label, extraLabel, index }) => {
    const newCheckbox = `- [${checked ? 'x' : ' '}] ${
      extraLabel && extraLabel + ':'
    }${label}`;
    updatedContent =
      updatedContent.substring(0, index) +
      newCheckbox +
      updatedContent.substring(index + newCheckbox.length);
  });

  writeFileSync(fileName, updatedContent, 'utf-8');
  console.log('File updated successfully.');
}

function reportOverdueTasks(checkboxes: CheckBox[]): void {
  const overdueTasks = checkboxes.filter(
    cb => !cb.checked && cb.due && cb.due < new Date()
  );

  if (overdueTasks.length > 0) {
    console.log('\x1b[31mOverdue tasks:\x1b[0m');
    overdueTasks.forEach(task =>
      console.log(
        `- ${task.label.trim()} (due: ${task.due!.toISOString().split('T')[0]})`
      )
    );
  } else {
    console.log('\x1b[32mNo overdue tasks.\x1b[0m');
  }
}

function getFileContent(fileName: string): FileContent {
  if (!existsSync(fileName)) {
    console.error(`\x1b[31mError:\x1b[0m File '${fileName}' does not exist.`);
    process.exit(1);
  }

  const fileContent = readFileSync(fileName, 'utf-8');
  const regex = /- \[(x| )\] (([ -a-zA-Z0-9]+):)?(.*?)( \(due: ([^)]+)\))?$/gm;
  const checkboxes: CheckBox[] = [];
  const attributes = frontMatter(fileContent).attributes;

  let match;
  while ((match = regex.exec(fileContent)) !== null) {
    checkboxes.push({
      index: match.index,
      checked: match[1] === 'x',
      label: match[4],
      extraLabel: match[3] || '',
      due: match[6] ? new Date(match[6]) : undefined,
    });
  }

  if (checkboxes.length === 0) {
    console.error(
      `\x1b[31mError:\x1b[0m No matching content found in '${fileName}'.`
    );
    process.exit(1);
  }

  return {
    content: fileContent,
    checkboxes,
    attributes: attributes as Colors,
  };
}

async function rateCommand(fileName: string) {
  const { checkboxes } = getFileContent(fileName);

  reportOverdueTasks(checkboxes);
  reportCheckboxState(checkboxes);
}

async function defaultCommand(fileName: string) {
  const { content, checkboxes, attributes } = getFileContent(fileName);

  reportOverdueTasks(checkboxes);

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
      message:
        `${
          checkbox.extraLabel
            ? chalk[attributes[checkbox.extraLabel] || 'gray'](
                checkbox.extraLabel.trim()
              )
            : ''
        }` + checkbox.label,
    })),
  } as PromptOptions)
    .then((response: unknown) => {
      const selectedIndices: number[] = (
        response as PromptResponse
      ).checkboxes.map((selected: string) => Number(selected));

      updateCheckboxesState(checkboxes, selectedIndices);
      updateFileContent(fileName, content, checkboxes);
    })
    .catch((error: Error) => {
      console.error('Error:', error);
    });
}

async function main() {
  const subCommand = process.argv[2];

  switch (subCommand) {
    case 'rate':
      // eslint-disable-next-line no-case-declarations
      const fileName = resolve(process.argv[3]);
      await rateCommand(fileName);
      break;
    default:
      defaultCommand(subCommand);
  }
}

main();
