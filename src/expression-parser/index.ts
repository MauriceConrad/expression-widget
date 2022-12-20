import ExpressionParts, { ExpressionPart } from './ExpressionParts.js';
import Expression from './Expression.js';
import { Operator } from './__operators.js';

class MathematicalExpression {
  expression: Expression;
  constructor(baseStr: string) {

    const str = MathematicalExpression.ensureExpressionsSyntatically(baseStr);

    const expParts = new ExpressionParts(str);

    // Construct theoretically mathematical structure
    this.expression = new Expression(expParts);

    // Normalize structure by replacing unnecessary brackets and reduce functions
    //this.expression = this.normalize();
  }
  normalize() {
    return this.map(e => {
      if (e.operands instanceof MathematicalExpression) {
        if (e.type == "brackets") {
          return e.operands.expression;
        }
        else {
          e.operands = e.operands.expression;
          return e;
        }
      }
      return e;
    });
  }
  forEach(handler: (exp: Expression) => void) {
    function loop(exp: Expression) {
      handler(exp);
      if (exp.operands instanceof Array) {
        for (let operand of exp.operands) {
          loop(operand);
        }
      }
    }
    loop(this.expression);
  }
  map(handler: (exp: Expression) => Expression) {
    function loop(exp: Expression) {
      if (exp.operands instanceof Array) {
        for (var i = 0; i < exp.operands.length; i++) {
          exp.operands[i] = loop(exp.operands[i]);
        }
      }
      return handler(exp);
    }
    return loop(this.expression);
  }
  static ensureExpressionsSyntatically(str: string) {
    const newStr = str.replace(/\s/g, '')//.replace(/([\+|\*|\/|\-|\^])(-([a-z]|[0-9]))/ig, /$1\($2\)/);
    return newStr;
  }
  static removeOutsideBrackets(exp: Operator) {
    return exp.str.substring(exp.str.search(/\(/) + 1, exp.str.length - 1);
  }
  static stringifyExp(expParts: ExpressionPart[]) {
    return expParts.map(p => (p.function ? p.function : "") + p.str).join("")
  }
}


export default MathematicalExpression;
