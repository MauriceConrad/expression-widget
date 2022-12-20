import { onMounted, ref, Ref, WritableComputedRef } from 'vue'
import Sortable, { MultiDrag, Swap } from 'sortablejs'
import { ExpressionController, retrieveExpressionChilds, SimpleExpression } from '../../../controllers/expression'
import uniqid from 'uniqid'
import _ from 'lodash'

//Sortable.mount(new MultiDrag(), new Swap());

export default function useDrag(listRef: Ref<HTMLDivElement | undefined>, opts: Partial<Sortable.Options>) {
  const sortable = ref<Sortable>();
  onMounted(() => {
    if (listRef.value) {
      sortable.value = new Sortable(listRef.value, {
        group: 'arguments',
        // sort: false,
        // delay: 0,
        animation: 150,
        easing: 'cubic-bezier(1, 0, 0, 1)',
        //handle: '.my-handle',
        filter: '.no-drag',
        //draggable: '.draggable',
        // preventOnFilter: true,
        //draggable: '.draggable',
        // dataIdAttr: 'data-id',
        // ghostClass: 'sortable-ghost',
        // chosenClass: 'sortable-chosen',
        // dragClass: 'sortable-dragg',
        // swapThreshold: 1,
        // invertSwap: false,
        // invertedSwapThreshold: 1,
        // direction: 'horizontal',
        ...opts
      });
    }
  });
  return {
    sortable: sortable as Ref<Sortable>
  }
}

export function useSortableEvents(expression: Ref<SimpleExpression>, expressionController: Ref<ExpressionController>, activeExpression: Ref<SimpleExpression | undefined>) {
  const localState = ref(uniqid());

  const handleSortableChoose = (event: Sortable.SortableEvent) => {
    //expressionController.value.draggingExpressions = 
    if (event.oldIndex !== undefined) {
      const childExpression = retrieveExpressionChilds(expression.value)[event.oldIndex];
      expressionController.value.draggingExpression = childExpression;
    }
    else {
      console.error('Drag initialization failed: oldIndex not defined');
    }
    
  }
  const handleSortableUnchoose = (event: Sortable.SortableEvent) => {
    //expressionController.value.draggingExpression = undefined;
  }
  
  const handleSortableChange = (event: Sortable.SortableEvent) => {

  }
  const handleSortableUpdate = (event: Sortable.SortableEvent) => {
    if (event.newIndex !== undefined && event.oldIndex !== undefined) {
      const childExpression = retrieveExpressionChilds(expression.value)[event.oldIndex];
      const oldActiveExpression = activeExpression.value;
      expressionController.value.moveTo(childExpression, event.newIndex);
      //localState.value = uniqid();
      expressionController.value.emit('rerender');
      // If somehow the activeExpression seems to be now different (because of the drag changed the pointing of the activeExpressionPath behind it)
      if (oldActiveExpression !== activeExpression.value) {
        activeExpression.value = oldActiveExpression;
      }
      
    }
    else {
      console.error('Drag failed: oldIndex or newIndex is not defined');
    } 
  }
  const handleSortableAdd = (event: Sortable.SortableEvent) => {
    if (expressionController.value.draggingExpression && event.newIndex !== undefined) {
      const oldActiveExpression = activeExpression.value;
      expressionController.value.sort(expressionController.value.draggingExpression, expression.value, event.newIndex);
      expressionController.value.emit('rerender');
      // If somehow the activeExpression seems to be now different (because of the drag changed the pointing of the activeExpressionPath behind it)
      if (oldActiveExpression !== activeExpression.value) {
        activeExpression.value = oldActiveExpression;
      }
    }
    else {
      console.log('dragging expression or newIndex is not defined');
    }

    
  }
  const handleSortableRemove = (event: Sortable.SortableEvent) => {
    //console.log('DONE REMOVE');
  }


  return {
    handleSortableChoose,
    handleSortableUnchoose,
    handleSortableChange,
    handleSortableUpdate,
    handleSortableAdd,
    handleSortableRemove,
    localState
  }
}