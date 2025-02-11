import { regEx } from '../../../util/regex';

const re = regEx(
  `(?<preNotes>.*### Release Notes)(?<releaseNotes>.*)### Configuration(?<postNotes>.*)`,
  's',
);

export function smartTruncate(input: string, len: number): string {
  if (input.length < len) {
    return {
      first: input,
      rest: []
    };
  }

  const reMatch = re.exec(input);
  if (!reMatch?.groups) {
    return {
      first: input.substring(0, len),
      rest: []
    }
  }

  const divider = `\n\n</details>\n\n---\n\n### Configuration`;
  const preNotes = reMatch.groups.preNotes;
  const releaseNotes = reMatch.groups.releaseNotes;
  const postNotes = reMatch.groups.postNotes;

  //Check the available length taking the maxim and substrating out the boilerplate length. Check if there is enough space for the release notes
  const availableLength = len - (preNotes.length + postNotes.length + divider.length);

  if (availableLength <= 0) {
    return splitStringAndSeparateFirst(input, len, len);
  } else {
    const parts = splitStringAndSeparateFirst(releaseNotes, availableLength, len);
    parts.first = preNotes + parts.first + divider + postNotes;
    return parts;
  }
}

function splitStringAndSeparateFirst(str: string, firstMaxLength: number, maxLength: number): object {
  // Call the splitString function to get the array of string parts
  const stringParts = splitString(str, firstMaxLength, maxLength);

  // Extract the first part and the rest of the parts
  const firstPart = stringParts[0];
  const remainingParts = stringParts.slice(1);

  // Return the first part separately and the rest as a list
  return {
    first: firstPart,
    rest: remainingParts
  };
}

function splitString(str: string, firstMaxLength: number, maxLength: number): string[] {
  const result: string[] = [];
  let remainingStr = str;

  // Handle the first part with a custom length
  if (remainingStr.length > firstMaxLength) {
    result.push(remainingStr.slice(0, firstMaxLength));
    remainingStr = remainingStr.slice(firstMaxLength);
  } else {
    result.push(remainingStr);
    return result; // Return early if the entire string fits within firstMaxLength
  }

  // Handle the remaining parts with the standard max length
  for (let i = 0; i < remainingStr.length; i += maxLength) {
    result.push(remainingStr.slice(i, i + maxLength));
  }

  return result;
}
