import { computed, onUnmounted, Ref } from 'vue'
import { Expression as CoreExpression } from '@bluepic/core'

export type SimpleExpressionIdentifierMember = CoreExpression.SimpleExpressionIdentifierStatic | CoreExpression.SimpleExpressionIdentifierExpression;

export type IdentifierMemberString = { type: 'static', value: string | number; };
export type IdentifierMemberIdentifier = { type: 'identifier', identifier: IdentifierMember[]; };
export type IdentifierMember = IdentifierMemberString | IdentifierMemberIdentifier;

export type AutocompleteTab = {
  type: 'tab',
  name: string;
  children: AutocompleteItem[];
}

export type AutocompleteItemFunction = {
  type: 'expression',
  expressionType: 'function',
  identifier: IdentifierMember[];
  name: string;
  label: string;
  maxArguments: number;
  minArguments: number;
  argumentsResolver: (oldExpression: CoreExpression.SimpleExpression | undefined) => CoreExpression.SimpleExpression[];
  children?: AutocompleteItem[];
}
export type AutocompleteItemIdentifier = {
  type: 'expression',
  expressionType: 'identifier',
  identifier: IdentifierMember[];
  label: string;
  children?: AutocompleteItem[];
}
export type AutocompleteGroup = {
  type: 'group';
  name: string;
  label: string;
  nested: boolean;
  children: AutocompleteItem[];
}
export type AutocompleteDivider = {
  type: 'divider';
  label: string;
}
export type AutocompleteItem = AutocompleteItemFunction | AutocompleteItemIdentifier | AutocompleteGroup | AutocompleteDivider;
export type AutocompleteItemWithPath = AutocompleteItem & { path: number[]; children?: AutocompleteItemWithPath[]; }

export function getMemberNames(item: AutocompleteItem) {
  if (item.type === 'expression') {
    return item.children?.map(childExpr => {
      if (childExpr.type === 'expression') {
        const lastMember = childExpr.identifier[childExpr.identifier.length - 1];
        if (lastMember.type === 'static') {
          return lastMember.value;
        }
      }
    });
  }
}

export function retrieveExpression(obj: AutocompleteItem | AutocompleteTab, path: number[]): AutocompleteItem | AutocompleteTab | undefined {
  if (obj.type === 'divider') {
    return undefined;
  }
  else {
    const subIndex = path[0];
    
    if (subIndex !== undefined) {
      if (obj.children) {
        return retrieveExpression(obj.children[subIndex], path.slice(1));
      }
      else {
        return undefined;
      }
    }
    else {
      return obj;
    }
  }
}

export function useAutocompleteShortcuts(selectedItemPath: Ref<number[]>, tabs: Ref<AutocompleteTab[]>, listenToKeyboard: Ref<boolean>) {
  function moveSelection (steps: number) {
    //const newTopLevel = selectedItemPath.value[selectedItemPath.value.length - 1] + steps;
    const currTopLevelItem = retrieveExpression(tabs.value[selectedItemPath.value[0]], selectedItemPath.value.slice(1, -1));
    const currTopLevelItemsLength = currTopLevelItem?.type !== 'divider' ? currTopLevelItem?.children?.length ?? 0 : 0;

    if (currTopLevelItem && currTopLevelItem?.type === 'divider') {
      return;
    }

    const startIndex = selectedItemPath.value[selectedItemPath.value.length - 1];
    let targetIndex = startIndex + steps;
    while (currTopLevelItem?.children && currTopLevelItem.children[targetIndex]?.type === 'divider') {
      targetIndex += Math.sign(steps);
    }
    
    selectedItemPath.value = [
      ...selectedItemPath.value.slice(0, -1),
      Math.min(Math.max(targetIndex, 0), currTopLevelItemsLength - 1)
    ];
  }
  function leaveSelection() {
    selectedItemPath.value = selectedItemPath.value.slice(0, -1);
  }
  function enterSelection() {
    const currSelectedItem = retrieveExpression(tabs.value[selectedItemPath.value[0]], selectedItemPath.value.slice(1));
    if (currSelectedItem?.type !== 'divider' && (currSelectedItem?.children?.length ?? -1) > 0) {      
      selectedItemPath.value = [...selectedItemPath.value, 0];
    }
  }
  const keydownEvent = (event: KeyboardEvent) => {
    if (listenToKeyboard.value) {
      if (event.key === 'ArrowDown') {
        moveSelection(1);
        event.preventDefault();
      }
      else if (event.key === 'ArrowUp') {
        moveSelection(-1);
        event.preventDefault();
      }
      else if (event.key === 'ArrowLeft') {
        leaveSelection();
        event.preventDefault();
      }
      else if (event.key === 'ArrowRight') {
        enterSelection();
      }
    }
  }
  window.addEventListener('keydown', keydownEvent);
  onUnmounted(() => {
    window.removeEventListener('keydown', keydownEvent);
  });

  return {

  }
}


export function expressionIdentifierToAutocompleteIdentifier(identifier: (CoreExpression.SimpleExpressionIdentifierExpression | CoreExpression.SimpleExpressionIdentifierStatic)[]): IdentifierMember[] {
  return identifier.map(member => {
    if (member.type === 'static') {
      return { type: 'static', value: member.name };
    }
    else {
      if (member.expression.type === 'Literal') {
        if (typeof member.expression.value === 'string' || typeof member.expression.value === 'number') {
          return { type: 'static', value: member.expression.value };
        }
        else {
          throw new Error('Identifier member expression value has a type that is not a string or a number');
          //return { type: 'static', value: 0 }
        }
      }
      else if (member.expression.type === 'Identifier') {
        return { type: 'identifier', identifier: expressionIdentifierToAutocompleteIdentifier(member.expression.identifier.filter(member => member !== undefined) as (CoreExpression.SimpleExpressionIdentifierExpression | CoreExpression.SimpleExpressionIdentifierStatic)[]) }
      }
      else {
        throw new Error('Identifier member expression is not of type Literal or Identifier');
        //return { type: 'static', value: 0 }
      }
    }
  })
  
}
export function autocompleteIdentifierToExpressionIdentifier(identifier: IdentifierMember[], expressionType: 'function' | 'identifier', funcArguments: CoreExpression.SimpleExpression[]): CoreExpression.SimpleExpressionIdentifier | CoreExpression.SimpleExpressionCallWithName {
  const idMemberToIdentifier = (member: IdentifierMember): CoreExpression.SimpleExpressionIdentifierExpression | CoreExpression.SimpleExpressionIdentifierStatic => {
    if (member.type === 'static') {
      if (typeof member.value === 'string') {
        return {
          type: 'static',
          name: member.value,
          call: false
        }
      }
      else {
        return {
          type: 'expression',
          expression: {
            type: 'Literal',
            raw: member.value.toString(),
            value: member.value
          }
        }
      }
    }
    else {
      return {
        type: 'expression',
        expression: {
          type: 'Identifier',
          identifier: member.identifier.map(idMemberToIdentifier)
        }
      }
    }
  }
  if (expressionType === 'identifier') {
    return {
      type: 'Identifier',
      identifier: identifier.map(idMemberToIdentifier)
    };
  }
  else {
    return {
      type: 'Call',
      arguments: funcArguments,
      identifier: identifier.map(idMemberToIdentifier)
    };
  }
}