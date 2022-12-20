import esprima from 'esprima'
import { Expression, ExpressionStatement, Identifier, Literal, Property, SpreadElement, MemberExpression } from 'estree'
import Emitter from 'eventemitter3'
// @ts-expect-error no types
import isVarName from 'is-var-name'
import _ from 'lodash'
import { computed, ref } from 'vue'
import uniqid from 'uniqid'
import path from 'path'

export type SimpleExpressionCallWithName = {
  type: 'Call',
  arguments: SimpleExpression[];
  identifier: (SimpleExpressionIdentifierStatic | SimpleExpressionIdentifierExpression | undefined)[];
  range?: [number, number];
} 
export type SimpleExpressionCallWithAnonymousFunction = {
  type: 'Call',
  arguments: SimpleExpression[];
  body: string;
  expression: SimpleExpression | null;
  range?: [number, number];
}
export type SimpleExpressionCall = SimpleExpressionCallWithName | SimpleExpressionCallWithAnonymousFunction;
export type SimpleExpressionOperation = {
  type: 'Operation';
  operator: string;
  operands: SimpleExpression[];
  range?: [number, number];
}
export type SimpleExpressionLiteral = {
  type: 'Literal';
  raw: string;
  value: boolean | string | number | undefined | null;
  range?: [number, number];
}
export type SimpleExpressionIdentifierStatic = {
  type: 'static';
  name: string;
  range?: [number, number];
}
export type SimpleExpressionIdentifierExpression = {
  type: 'expression';
  expression: SimpleExpression;
  range?: [number, number];
}
export type SimpleExpressionIdentifier = {
  type: 'Identifier',
  identifier: (SimpleExpressionIdentifierStatic | SimpleExpressionIdentifierExpression | undefined)[];
  range?: [number, number];
}
export type SimpleExpressionArray = {
  type: 'Array';
  items: SimpleExpression[];
  range?: [number, number];
}
export type SimpleExpressionObject = {
  type: 'Object';
  properties: {
    key: string;
    value: SimpleExpression;
    range?: [number, number];
  }[];
  range?: [number, number];
}
export type SimpleExpressionUnparsed = {
  type: 'Unparsed',
  estreeExpression: Expression | SpreadElement;
}
export type SimpleExpression = SimpleExpressionCall | SimpleExpressionOperation | SimpleExpressionLiteral | SimpleExpressionIdentifier | SimpleExpressionArray | SimpleExpressionObject | SimpleExpressionUnparsed;

export const supportedExprTypes = ['CallExpression', 'ArrowFunctionExpression', 'BinaryExpression', 'UnaryExpression', 'Literal', 'ArrayExpression', 'MemberExpression'];

export function parseExpr(baseExpr: string) {
  const program = esprima.parseScript(baseExpr, { range: true });

  function getMemberExpressionChain(expr: MemberExpression): (SimpleExpressionIdentifierStatic | SimpleExpressionIdentifierExpression | undefined)[] {
    if (expr.type == 'MemberExpression') {
      const propIdentifier = ((): SimpleExpressionIdentifierStatic | SimpleExpressionIdentifierExpression => {
        if (expr.property.type === 'Identifier' && !expr.computed) {
          return {
            type: 'static',
            name: expr.property.name,
            range: expr.property.range
          } as SimpleExpressionIdentifierStatic;
        }
        else {
          return {
            type: 'expression',
            expression: resolveExpr(expr.property as Expression),
            range: expr.property.range
          } as SimpleExpressionIdentifierExpression;
        }
      })();
      if (expr.object.type === 'Identifier') {
        return [{
          type: 'static',
          name: expr.object.name,
          range: expr.object.range
        } as SimpleExpressionIdentifierStatic, propIdentifier]
      }
      else if (expr.object.type === 'MemberExpression') {
        return [
          ...getMemberExpressionChain(expr.object),
          propIdentifier
        ];
      }
      else {
        throw new Error('Object is not a member expression');
      }
    }
    else {
      throw new Error('Not a member expression');
    }
  }
  
  const resolveExpr = (expr: Expression | SpreadElement): SimpleExpression => {
    if (expr.type === 'CallExpression') {
      if (expr.callee.type === 'Identifier') {
        return {
          type: 'Call',
          arguments: expr.arguments.map(resolveExpr),
          identifier: [{
            type: 'static',
            name: expr.callee.name,
            range: expr.range
          }],
          range: expr.range
        } as SimpleExpressionCallWithName
      }
      else if (expr.callee.type === 'MemberExpression') {
        return {
          type: 'Call',
          arguments: expr.arguments.map(resolveExpr),
          identifier: getMemberExpressionChain(expr.callee),
          range: expr.range
        } as SimpleExpressionCallWithName
      }
      else if (expr.callee.type === 'ArrowFunctionExpression') {
        return {
          type: 'Call',
          arguments: expr.arguments.map(resolveExpr),
          body: baseExpr.slice((expr.callee.range as [number, number])[0], (expr.callee.range as [number, number])[1]),
          expression: expr.callee.expression ? resolveExpr(expr.callee.body as Expression) : null,
          range: expr.range
        } as SimpleExpressionCallWithAnonymousFunction
      }
    }
    else if (expr.type === 'BinaryExpression') {
      return {
        type: 'Operation',
        operator: expr.operator,
        operands: [
          resolveExpr(expr.left),
          resolveExpr(expr.right)
        ],
        range: expr.range
      } as SimpleExpressionOperation;
    }
    else if (expr.type === 'UnaryExpression') {
      return {
        type: 'Operation',
        operator: expr.operator,
        operands: [
          resolveExpr(expr.argument)
        ],
        range: expr.range
      } as SimpleExpressionOperation;
    }
    else if (expr.type === 'Literal') {
      return {
        type: 'Literal',
        raw: expr.raw,
        value: expr.value,
        range: expr.range
      } as SimpleExpressionLiteral;
    }
    else if (expr.type === 'MemberExpression') {
      
      return {
        type: 'Identifier',
        identifier: getMemberExpressionChain(expr),
        range: expr.range
      } as SimpleExpressionIdentifier;
    }
    else if (expr.type === 'Identifier') {
      return {
        type: 'Identifier',
        identifier: [{
          type: 'static',
          name: expr.name,
          range: expr.range
        }],
        range: expr.range
      } as SimpleExpressionIdentifier;
    }
    else if (expr.type === 'ArrayExpression') {
      return {
        type: 'Array',
        items: expr.elements.map(el => el !== null ? resolveExpr(el): null),
        range: expr.range
      } as SimpleExpressionArray;
    }
    else if (expr.type === 'ObjectExpression') {
      return {
        type: 'Object',
        properties: expr.properties.map(property => {
          if (property.type === 'Property') {
            return {
              key: property.key.type === 'Identifier' ? property.key.name : property.key.type === 'Literal' ? property.key.value : undefined,
              value: resolveExpr(property.value as Expression),
              range: property.range
              //value: property.value.type === 'A' ? resolveExpr(property.value) :
            } as any;
          }
          else {
            return {
              type: 'Unparsed',
              estreeExpression: expr
            }
          }
        }),
        range: expr.range
      } as SimpleExpressionObject;
    }

    return {
      type: 'Unparsed',
      estreeExpression: expr,
      //range: expr.range as 
    };
  }

  const root = program.body[0];

  if (root.type === 'ExpressionStatement') {
    return resolveExpr(root.expression);
  }

}



export function duplicateExpression(expression: SimpleExpression, rootExpression: SimpleExpression) {

}
export const EXPRESSION_CHILDS_ARRAY_KEYS = {
  'Call': 'arguments',
  'Operation': 'operands',
  'Array': 'items',
  //'Identifier': 'identifier'
}
// export const getExpressionChildsArrayKey = (expr: SimpleExpression) => {
//   if (expr.type === 'Call') {
//     return 'arguments';
//   }
//   else if (expr.type === 'Operation') {
//     return 'operands';
//   }
//   if (expr.type === 'Array') {
//     return 'items';
//   }
//   if (expr.type === 'Identifier') {
//     return 'identifier';
//   }
//   else {
//     return undefined;
//   }
// };
export function retrieveExpressionChilds(expr: SimpleExpression, objects = false) {
  // const key = getExpressionChildsArrayKey(expr);
  // if (key && key in expr) {
  //   return (expr as any)[key] as SimpleExpression[];
  // }
  // else {
  //   return [];
  // }
  if (expr.type === 'Call') {
    return expr['arguments'];
  }
  else if (expr.type === 'Operation') {
    return expr['operands'];
  }
  if (expr.type === 'Array') {
    return expr['items'];
  }
  if (expr.type === 'Identifier') {
    return expr['identifier'].filter(identifierMember => identifierMember?.type === 'expression').map(identifierMember => (identifierMember as SimpleExpressionIdentifierExpression).expression)
  }
  else if (objects && expr.type === 'Object') {
    return expr['properties'].map(property => property.value);
  }
  else {
    return [];
  }
}
// This generic function replaces a given expression within a given parent expression's child expressions array
export function replaceChildExpressionWithinArray(parentExpression: SimpleExpression, expression: SimpleExpression, newExpression: SimpleExpression, arrayKey: string) {
  const childsArray = parentExpression[arrayKey as keyof typeof parentExpression] as any as SimpleExpression[];
  const exprArgIndex = childsArray.indexOf(expression);
  (parentExpression[arrayKey as keyof typeof parentExpression] as any as SimpleExpression[]) = childsArray.map((childExpression, index) => {
    if (index === exprArgIndex) {
      return newExpression;
    }
    else {
      return childExpression;
    }
  });
}
export function replaceChildWithinIdentifier(parentExpression: SimpleExpressionIdentifier, expression: SimpleExpression, newExpression: SimpleExpression) {
  parentExpression.identifier = parentExpression.identifier.map(identifierMember => {
    if (identifierMember?.type === 'expression' && identifierMember.expression === expression) {
      return {
        ...identifierMember,
        expression: newExpression
      }
    }
    else {
      return identifierMember;
    }
  })
}


export function collectAllExpressions(rootExpr: SimpleExpression, objects?: boolean) {
  const flattenChildExpressions = (expressions: SimpleExpression[]) => ([] as SimpleExpression[]).concat(...expressions.map(collect));
  const collect = (expr: SimpleExpression): SimpleExpression[] => {
    return [
      expr,
      ...flattenChildExpressions(retrieveExpressionChilds(expr, objects))
    ];
  }
  return collect(rootExpr);
}

export function findClosestExpression(rootExpression: SimpleExpression, selectionStart: number, selectionEnd: number): SimpleExpression | undefined {
  const allExpressions = collectAllExpressions(rootExpression, true);
  const allExpressionsInWhichSelectionIsSubsetOf = allExpressions.filter(expression => {
    if (expression.type !== 'Unparsed' && expression.range) {
      return expression.range[0] <= selectionStart && expression.range[1] >= selectionEnd;
    }
    else {
      return false;
    }
  });
  // The closest expression is always the last one in this array because the collectAllExpressionsFunctions works that way recursively
  // There is no need to sort them here because this is always true
  return allExpressionsInWhichSelectionIsSubsetOf[allExpressionsInWhichSelectionIsSubsetOf.length - 1]
}
export function findExactMatchingExpression(rootExpression: SimpleExpression, selectionStart: number, selectionEnd: number): SimpleExpression | undefined {
  const allExpressions = collectAllExpressions(rootExpression, true);
  const allExpressionsWithExactRange = allExpressions.filter(expression => {
    if (expression.type !== 'Unparsed' && expression.range) {
      return expression.range[0] == selectionStart && expression.range[1] == selectionEnd;
    }
    else {
      return false;
    }
  });
  return allExpressionsWithExactRange[allExpressionsWithExactRange.length - 1];
}


export class ExpressionController extends Emitter {
  expression: SimpleExpression;
  draggingExpression: SimpleExpression | undefined;
  // activeExpressionPath: number[] | undefined;
  // set activeExpression(newActiveExpression: SimpleExpression | undefined) {
  //   if (newActiveExpression) {
  //     this.activeExpressionPath = this.getExpressionPath(newActiveExpression);
  //   }
  // }
  // get activeExpression(): SimpleExpression | undefined {
  //   if (this.activeExpressionPath) {
  //     return this.retrieveExpressionByPath(this.activeExpressionPath);
  //   }
  //   else {
  //     return undefined;
  //   }
  // }
  //renderState = ref(uniqid());
  constructor(expression: SimpleExpression) {
    super();
    this.expression = expression;
  }
  getAllExpressions(startExpr?: SimpleExpression) {
    return collectAllExpressions(startExpr ?? this.expression);
  }
  getParentExpression(expr: SimpleExpression) {
    
    return this.getAllExpressions().find(currExpr => retrieveExpressionChilds(currExpr).includes(expr));
  }
  duplicate(expr: SimpleExpression) {
    this.ensureParentIsFunction(expr);
    const parentExpression = this.getParentExpression(expr);
    if (parentExpression) {
      const exprIndexWithinParentExpr = this.getExprIndex(expr);
      const duplicatedExpr = _.cloneDeep(expr);

      this.insertExpression(parentExpression, duplicatedExpr, exprIndexWithinParentExpr + 1);


      this.emit('update', this.expression);
    }
    else {
      throw new Error('Conversion not possible because no parent expression exists (mostly because this is the root one)');
    }
  }
  delete(expr: SimpleExpression) {
    this.ensureParentIsFunction(expr);
    this.deleteExpression(expr);
    this.emit('update', this.expression);
  }
  moveTo(exr: SimpleExpression, pos: number) {
    this.move(exr, pos);
    this.emit('update', this.expression);
  }
  moveBy(expr: SimpleExpression, steps: number) {
    const newExprIndex = this.getExprIndex(expr) + steps;
    this.move(expr, newExprIndex);
    this.emit('update', this.expression);
  }
  sort(expr: SimpleExpression, newParentExpression: SimpleExpression, newIndex: number) {
    this.deleteExpression(expr);
    this.insertExpression(newParentExpression, expr, newIndex);
    this.emit('update', this.expression);
  }
  insert(parentExpression: SimpleExpression, newChildExpression: SimpleExpression, index: number) {
    this.insertExpression(parentExpression, newChildExpression, index);
  }
  replace(expression: SimpleExpression, newExpression: SimpleExpression) {
    const newExpr = this.replacExpression(expression, newExpression);
    this.emit('update', this.expression);
    return newExpr;
  }
  private move(expr: SimpleExpression, pos: number) {
    const parentExpression = this.getParentExpression(expr);
    if (parentExpression) {
      this.modifyChildExpressions(parentExpression, childExpressions => {
        const childsWithoutMovingOne = childExpressions.filter(child => child !== expr);
        return [
          ...childsWithoutMovingOne.slice(0, pos),
          expr,
          ...childsWithoutMovingOne.slice(pos)
        ];
      });
    }
  }
  private getExprIndex(expr: SimpleExpression) {
    const parentExpression = this.getParentExpression(expr);
    if (parentExpression) {
      return retrieveExpressionChilds(parentExpression).indexOf(expr);
    }
    else {
      return -1;
    }
  }
  getExpressionPath(expression: SimpleExpression) {
    const checkExpr = (currExpression: SimpleExpression, path: number[]): number[] | undefined => {
      const childs = retrieveExpressionChilds(currExpression);
      if (currExpression == expression) {
        return path;
      }
      else if (childs.length > 0) {
        return childs.map((childExpr, index) => checkExpr(childExpr, [ ...path, index ])).filter(result => result !== undefined)[0];
      }
    }
    return checkExpr(this.expression, []);
  }
  retrieveExpressionByPath(path: number[]) {
    const checkExpr = (currExpression: SimpleExpression, currPath: number[]): SimpleExpression | undefined => {
      if (_.isEqual(currPath, path)) {
        return currExpression;
      }
      else {
        return retrieveExpressionChilds(currExpression).map((expr, index) => checkExpr(expr, [ ...currPath, index])).find(expr => expr !== undefined);
      }
      // const childs = retrieveExpressionChilds(currExpression);
      // if (currExpression == expression) {
      //   return path;
      // }
      // else if (childs.length > 0) {
      //   return childs.map((childExpr, index) => checkExpr(childExpr, [ ...path, index ])).filter(result => result !== undefined)[0];
      // }
    }
    return checkExpr(this.expression, []);
  }
  toFunction(expr: SimpleExpressionOperation) {
    return this.convertOperationToFunction(expr);
  }
  private ensureParentIsFunction(expr: SimpleExpression) {
    const parentExpression = this.getParentExpression(expr);
    if (parentExpression) {
      if (parentExpression.type === 'Operation') {
        this.convertOperationToFunction(parentExpression);
        this.modifyChildExpressions(parentExpression, childExpressions => childExpressions.filter(childExpression => childExpression !== expr));
      }
    }
    else {
      throw new Error('Conversion not possible because no parent expression exists (mostly because this is the root one)');
    }
  }
  private modifyChildExpressions(expr: SimpleExpression, replacer: (expressions: SimpleExpression[]) => SimpleExpression[]) {
    if (expr.type === 'Identifier') {
      console.error('Not supported yet');
      
      
    }
    else {
      const childsKey = (() => {
        if (expr.type === 'Call') {
          return 'arguments';
        }
        else if (expr.type === 'Operation') {
          return 'operands';
        }
        if (expr.type === 'Array') {
          return 'items';
        }
      })();
      if (childsKey) {
        (expr as any)[childsKey] = replacer((expr as any)[childsKey]);
      }
    }
    // const childsKey = getExpressionChildsArrayKey(expr) as any;
    // (expr as any)[childsKey] = replacer((expr as any)[childsKey]);
  }
  private deleteExpression(expr: SimpleExpression) {
    const parentExpression = this.getParentExpression(expr);
    if (parentExpression) {
      this.modifyChildExpressions(parentExpression, childExpressions => childExpressions.filter(childExpression => childExpression !== expr));
    }
    else {
      throw new Error('Deletion failed, no parent expression found (mostly because this is the root expression)');
    }
  }
  private insertExpression(parentExpression: SimpleExpression, newChildExpression: SimpleExpression, index: number) {
    //const childsKey = getExpressionChildsArrayKey(parentExpression) as any;
    // (parentExpression as any)[childsKey] = [
    //   ...(parentExpression as any)[childsKey].slice(0, index),
    //   newChildExpression,
    //   ...(parentExpression as any)[childsKey].slice(index),
    // ];
    this.modifyChildExpressions(parentExpression, childExpressions => [
      ...childExpressions.slice(0, index),
      newChildExpression,
      ...childExpressions.slice(index)
    ]);
  }
  private replacExpression(expression: SimpleExpression, newExpression: SimpleExpression) {
    const parentExpression = this.getParentExpression(expression);
    
    if (parentExpression) {
      if (parentExpression.type === 'Call') {
        replaceChildExpressionWithinArray(parentExpression, expression, newExpression, 'arguments');
      }
      else if (parentExpression.type === 'Operation') {
        replaceChildExpressionWithinArray(parentExpression, expression, newExpression, 'operands');
      }
      else if (parentExpression.type === 'Array') {
        replaceChildExpressionWithinArray(parentExpression, expression, newExpression, 'items');
      }
      else if (parentExpression.type === 'Identifier') {
        replaceChildWithinIdentifier(parentExpression, expression, newExpression);
      }
      else {
        throw new Error('Unable to replace expression in parent expression because no handler for childs was found');
      }
    }
    else {
      // Seems to be the global root expression, so we're replacing it directly on the instance level
      this.expression = newExpression;
      this.emit('update', this.expression);
    }

    // this.emit('update', this.expression);

    return newExpression;
  }
  static OPEARTOR_FUNCTION_NAMES = {
    '+': 'ADD',
    '-': 'SUB',
    '*': 'MULT',
    '/': 'DIV',
    '!': 'NOT'
  };
  private convertOperationToFunction(expression: SimpleExpressionOperation) {
    const name = (() => {
      if (expression.operator in ExpressionController.OPEARTOR_FUNCTION_NAMES) {
        return ExpressionController.OPEARTOR_FUNCTION_NAMES[expression.operator as keyof typeof ExpressionController.OPEARTOR_FUNCTION_NAMES];
      }
      else {
        return undefined;
      }
    })();
    if (name) {
      return this.replacExpression(expression, {
        type: 'Call',
        arguments: expression.operands,
        identifier: [{ type: 'static', name }]
      });
    }
    else {
      throw new Error('Conversion to function failed, no name retrieved')
    }
  }
  static stringifyIdentifier(identifier: (SimpleExpressionIdentifierExpression | SimpleExpressionIdentifierStatic | undefined)[]) {
    const members = (identifier.filter(member => member !== undefined) as (SimpleExpressionIdentifierStatic | SimpleExpressionIdentifierExpression)[]).map(member => {
      if (member.type === 'expression' || !isVarName(member.name)) {
        const expression = member.type === 'static' ? { type: 'Literal', raw: JSON.stringify(member.name), value: member.name } as SimpleExpressionLiteral : member.expression;
        return `[${ ExpressionController.toString(expression) }]`;
      }
      else {
        return member.name;
      }
    });
    let str = '';
    let index = 0;
    for (const member of members) {
      str += `${ index > 0 && member.indexOf('[') !== 0 ? '.' : '' }${ member }`;
      index++;
    }
    return str;
  }
  static toString(expr: SimpleExpression): string {
    if (expr.type === 'Literal') {
      return JSON.stringify(expr.value);
    }
    else if (expr.type === 'Identifier') {
      return ExpressionController.stringifyIdentifier(expr.identifier);
    }
    else if (expr.type === 'Operation') {
      if (expr.operands.length >= 2) {
        return expr.operands.map(ExpressionController.toString).join(` ${ expr.operator } `);
      }
      else {
        return `${ expr.operator }${ ExpressionController.toString(expr.operands[0]) }`;
      }
    }
    else if (expr.type === 'Array') {
      return `[${ expr.items.map(ExpressionController.toString).join(', ') }]`;
    }
    else if (expr.type === 'Object') {
      return `{ ${ expr.properties.map(({ key, value }, index) => `${ isVarName(key) ? key : JSON.stringify(key) }: ${ ExpressionController.toString(value) }`).join(', ') } }`
    }
    else if (expr.type === 'Call') {
      return `${ (expr as SimpleExpressionCallWithName).identifier ? ExpressionController.stringifyIdentifier((expr as SimpleExpressionCallWithName).identifier) : `(() => 0)` }(${ expr.arguments.map(ExpressionController.toString).join(', ') })`;
    }
    else {
      return 'undefined';
    }
  }
  toString() {
    return ExpressionController.toString(this.expression);
  }
}