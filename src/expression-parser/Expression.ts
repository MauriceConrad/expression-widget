import ExpressionParts, { ExpressionPart } from './ExpressionParts';
import MathematicalExpression from './index';
import __operators from './__operators.js';

class Expression {
  type?: string;
  value?: string;
  raw?: string;
  operands?: MathematicalExpression | Expression[] | Expression;
  function?: string;
  operation?: string;
  args?: Expression[];
  constructor(expParts: ExpressionPart[] | ExpressionPart | ExpressionParts) {

    // If given party array is not an array but an object containing a variable
    if (!(expParts instanceof Array) && !(expParts instanceof ExpressionParts)) {
      this.type = "value";
      this.value = expParts.str;
      return;
    }
    // If there is just one part, we do not have to figure out the recursive range their are related together
    if (expParts instanceof Array && expParts.length == 1) {
      // Get single expression
      const singleExpression = expParts[0];
      // If the expression has children
      if (singleExpression.hasChildren) {
        // Remove brackets and get raw string
        this.raw = MathematicalExpression.removeOutsideBrackets(singleExpression);
        // Get operands by parsing expression from top level again
        this.operands = new MathematicalExpression(this.raw as string);

        // Set the type of the operation
        this.type = singleExpression.function ? "function" : "brackets";

        // If the operation is a function, also store the function name
        if (singleExpression.function) {
          this.function = singleExpression.function;
          if (singleExpression.args) {
            this.args = singleExpression.args.map(expr => expr.expression);
          }
          else {
            this.args = [];
          }
        }

      }
      // Expression is the root one and there are no children
      else {
        this.type = "value";
        this.value = singleExpression.str;
      }
    }
    // More than one expression parts, so we figure out their range
    else if (expParts instanceof Array) {
      // Get position of next lower order operator (+, -)
      const regexLowerOperators = __operators.toRegExp(__operators.getByLevel(0));
      const regexHigherOperators = __operators.toRegExp(__operators.getByLevel(1));

      const lowOperatorPos = indexOfByFunc(expParts, p => {
        return p.type == "operator" && p.str.search(regexLowerOperators) > -1; // /[\+|\-]/
      }, 0);
      // Get position of next higher order operator(*, /, ^)
      const highOperatorPos = indexOfByFunc(expParts, p => {
        return p.type == "operator" && p.str.search(regexHigherOperators) > -1; // /[\*|\/|\^]/
      }, 0);


      // If there exists a lower order (+/-) operator, use it as delimiter
      const operatorIndex = lowOperatorPos > -1 ? lowOperatorPos : highOperatorPos;

      // Set operands to instances of Operation by delimiting at the index of the operator we're using to split
      this.operands = [
        new Expression(expParts.slice(0, operatorIndex)),
        new Expression(expParts.slice(operatorIndex + 1))
      ];
      // Set raw expression
      this.raw = MathematicalExpression.stringifyExp(expParts);
      // Set type of Operation to "operation"
      this.type = "operation";
      this.operation = expParts[operatorIndex].str;
    }
  }
}

function indexOfByFunc<T>(arr: T[], check: (item: T) => boolean, start: number) {
  for (let i = start; i < arr.length; i++) {
    if (check(arr[i])) {
      return i;
    }
  }
  return -1;
}

export default Expression;
