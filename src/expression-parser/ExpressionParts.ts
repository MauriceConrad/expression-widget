import { regexIndexOf, getOperator, findClosingBracketPos } from './helper';
import __operators from './__operators';
import { parseArguments } from 'css-expression';
import MathematicalExpression from '.';

export type ExpressionPart = {
  type: 'variable' | 'expression' | 'operator';
  hasChildren?: boolean;
  str: string;
  function?: string | null;
  args?: MathematicalExpression[];
}

class ExpressionParts {
  constructor(str: string) {
    // Instead of making the parsing algorithm evcen more complex, just add a 0 before the MINUS symbol if it's a n implicit subtraction from 0 (negative integer)
    if (str[0] === "-") {
      str = "0" + str;
    }

    const regexOperators = __operators.toRegExp(__operators.operators);

    // Check wether
    const regexIsNoVariable = __operators.toRegExp(__operators.operators.concat({ str: '(' }));
    const isVariable = str.search(regexIsNoVariable) == -1; // /[\+|\*|\/|\-|\^|\(]/

    if (isVariable) {
      return {
        type: "variable",
        str
      }
    }
    else {
      // Array of same level expressions and operators (mathematical rules excludes here, just parse the real brackets)
      const logigalParts: ExpressionPart[] = [];
      // Current position
      let pos = 0;
      let i = 0;
      while (pos < str.length && i < 1000) {
        // Get position of next brackets
        let nextBracketPos = str.indexOf("(", pos);
        nextBracketPos = nextBracketPos > -1 ? nextBracketPos : Infinity;
        // Get position of next operator
        let nextOperatorPos = regexIndexOf(str, regexOperators, pos); // /[\+|\*|\/|\-|\^]/
        nextOperatorPos = nextOperatorPos > -1 ? nextOperatorPos : Infinity;

        // If operator is closer than next bracket, interpret this expression as valid one without sub expressions
        if (nextOperatorPos < nextBracketPos || (nextOperatorPos == Infinity && nextBracketPos == Infinity)) {
          // Get expression string
          const currExp = str.substring(pos, nextOperatorPos);
          // Get operator which was closer and the reason why this expression does not have any sub expressions
          const operator = getOperator(str, nextOperatorPos);
          // Push expression to array of logical parts
          logigalParts.push({
            type: "expression",
            hasChildren: false,
            str: currExp
          });
          // If operator is valid, also push the oeprator als a part (at this level we do not go deeper on a "same bracket level")
          if (operator) {
            // Push operator description object
            logigalParts.push({
              type: "operator",
              str: operator
            });
          }
          // Go futher with cursor
          pos = nextOperatorPos + 1;
        }
        else {
          // If next bracket is closer than next operator, it seems that we have some sub expressions
          // get the string to the next bracket becasue this is the function call (if empty, it's just brackets but both have the same problem)
          const strToNextBracket = str.substring(pos, nextBracketPos);
          // Get bracket's position that closes the current bracket
          const closingBracketPos = findClosingBracketPos(str, nextBracketPos);
          // Get inner string of expression
          const innerStr = str.substring(nextBracketPos, closingBracketPos);

          // Try to get operator's position next to it
          const nextOperatorPos = regexIndexOf(str, regexOperators, closingBracketPos);
          // Try to get the operator
          const operator = nextOperatorPos > -1 ? getOperator(str, nextOperatorPos) : null;


          const argsRaw = innerStr.slice(1, -1);
          const args = parseArguments(argsRaw).map(arg => {
            return new MathematicalExpression(arg);
          });

          
          // always push the expression
          logigalParts.push({
            type: "expression",
            hasChildren: true,
            function: strToNextBracket || null,
            str: innerStr,
            args
          });
          // If the operator is valid, also push the operator as part
          if (operator) {
            logigalParts.push({
              type: "operator",
              str: operator
            });
          }
          // Go futher with cursor
          pos = closingBracketPos + 1;
        }

        i++;
      }
      return logigalParts;
    }
  }
}

export default ExpressionParts;
