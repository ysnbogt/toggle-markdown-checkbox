import { prompt } from 'enquirer';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

async function main() {
  const fileName = resolve(process.argv[2]);
  const fileContent = readFileSync(fileName, 'utf-8');
  const regex = /^- \[(x| )\](.*)$/gm;
  let match;
  const checkboxes: { index: number; checked: boolean; label: string }[] = [];

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
  } as any)
    .then((response: any) => {
      const selectedIndices: number[] = response.checkboxes.map(
        (selected: string) => Number(selected)
      );

      checkboxes.forEach((_, index) => {
        if (selectedIndices.includes(index)) {
          checkboxes[index].checked = true;
          return;
        }
        checkboxes[index].checked = false;
      });

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
    })
    .catch((error: any) => {
      console.error('Error:', error);
    });
}

main();
