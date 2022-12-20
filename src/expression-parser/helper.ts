export function findClosingBracketPos(str: string, pos: number) {
  let opening = 0;
  let closing = 0;
  do {
    const nextBracketPos = regexIndexOf(str, /[\(|\)]/, pos);
    const nextBracket = str.substr(nextBracketPos, 1);
    if (nextBracket == '(') {
      opening++;
    }
    else {
      closing++;
    }
    pos = nextBracketPos + 1;
  } while (opening > closing);

  return pos;
}

export function getOperator(str: string, pos: number) {
  return str.substr(pos, 1);
}

export function regexIndexOf(string: string, regex: RegExp, startpos: number) {
    var indexOf = string.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}
