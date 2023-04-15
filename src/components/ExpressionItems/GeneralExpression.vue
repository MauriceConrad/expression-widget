<template>
  <div ref="wrapperRef" class="general-expression" :class="{ active, 'context-menu-active': showDropdown, 'dark-mode': isDarkMode, 'disabled': !isEnabled }" @contextmenu="handleContextmenu">
    <Operation v-if="modelValue.type === 'Operation'" :operands="modelValue.operands" :operator="modelValue.operator" :active="active" class="expression-component" :class="{ disabled: !isEnabled }" @select="handleSelect" />
    <Literal v-else-if="modelValue.type === 'Literal'" :raw="modelValue.raw" :value="modelValue.value" :active="active" class="expression-component" :class="{ disabled: !isEnabled }" @select="handleSelect" />
    <Identifier v-else-if="modelValue.type === 'Identifier'" :state="localState" :identifier="modelValue.identifier" :active="active" class="expression-component" :class="{ disabled: !isEnabled }" @select="handleSelect" />
    <Call v-else-if="modelValue.type === 'Call'" :state="localState" :body="(modelValue as any).body" :identifier="(modelValue as any).identifier" :arguments="modelValue.arguments" :active="active" class="expression-component" :class="{ disabled: !isEnabled }" @select="handleSelect" @sortable:choose="handleSortableChoose" @sortable:unchoose="handleSortableUnchoose" @sortable:update="handleSortableUpdate" @sortable:add="handleSortableAdd" @sortable:remove="handleSortableRemove" />
    <Object v-else-if="modelValue.type === 'Object'" :properties="modelValue.properties" :active="active" class="expression-component" :class="{ disabled: !isEnabled }" @select="handleSelect" />
    <Array v-else-if="modelValue.type === 'Array'" :state="localState" :items="modelValue.items" :active="active" class="expression-component" :class="{ disabled: !isEnabled }" @select="handleSelect" />
    <Unparsed v-else-if="modelValue.type === 'Unparsed'" :raw="modelValue.raw" :estree-expression="modelValue.estreeExpression" :active="active" class="expression-component" :class="{ disabled: !isEnabled }" @select="handleSelect" />
    <div v-if="active" class="active-indicator" />
    <n-dropdown placement="bottom-start" trigger="manual" :x="dropdownPos.x" :y="dropdownPos.y" :options="dropdownOptions" :show="showDropdown" @clickoutside="handleDropdownClickOutside" @select="handleDropdopwnSelect" />
    <n-tooltip :show="showEvaluatedExpressionTooltip" placement="bottom-start" trigger="manual" class="general-expression-evaluated-value-tooltip" :class="{ error: evaluationError }">
      <template #trigger>
        <span></span>
      </template>
      <span v-if="!evaluationError">{{ evaluatedValue }}</span>
      <span v-else>{{ evaluationError }}</span>
    </n-tooltip>
  </div>
</template>

<script setup lang="ts">
import { inject, Ref, computed, reactive, ref, toRef, onUnmounted } from 'vue'
import { Expression as CoreExpression } from '@bluepic/core'
import Operation, { actions as OperationActions } from './Operation.vue'
import Literal, { actions as LiteralActions } from './Literal.vue'
import Identifier, { actions as IdentifierActions } from './Identifier.vue'
import Call, { actions as CallActions } from './Call.vue'
import Object, { actions as ObjectActions } from './Object.vue'
import Array, { actions as ArrayActions } from './Array.vue'
import Unparsed, { actions as UnparsedActions } from './Unparsed.vue'
import { NDropdown, NTooltip } from 'naive-ui'
import renderIcon from '../../util/renderIcon'
import { ArrowBackOutline, ArrowForwardOutline, CopyOutline, RefreshOutline, TrashOutline } from '@vicons/ionicons5'
import { useSortableEvents } from './controllers/drag'

const actions = {
  'Operation': OperationActions,
  'Literal': LiteralActions,
  'Identifier': IdentifierActions,
  'Call': CallActions,
  'Object': ObjectActions,
  'Array': ArrayActions,
  'Unparsed': UnparsedActions
}

const props = defineProps<{
  modelValue: CoreExpression.SimpleExpression;
}>();
const emit = defineEmits(['update:model-value']);

const activeExpression = inject('activeExpression') as Ref<CoreExpression.SimpleExpression | undefined>;
const expressionController = inject('expressionController') as Ref<CoreExpression.ExpressionController>;

const isDarkMode = inject('isDarkMode') as Ref<Boolean>;

const evalExpression = inject('evalExpression') as (expression: CoreExpression.SimpleExpression) => any;


const altKey = ref(false);
const altKeyListener = (event: KeyboardEvent) => {
  if (event.key === 'Alt') {
    altKey.value = true;
  }
}
const keyReleaseListener = () => {
  altKey.value = false;
}
window.addEventListener('keydown', altKeyListener);
window.addEventListener('keyup', keyReleaseListener);
onUnmounted(() => {
  window.removeEventListener('keydown', altKeyListener);
  window.removeEventListener('keyup', keyReleaseListener);
});


const active = computed(() => {
  return props.modelValue === activeExpression.value;
});

const evaluationError = ref<string>();
const evaluatedValue = computed(() => {
  if (!activeExpression.value) {
      return;
    }
  try {
    const value = evalExpression(activeExpression.value);
    evaluationError.value = undefined;
    return value;
  }
  catch (err) {
    evaluationError.value = (err as Error).message;
    return undefined;
  }
});


const showEvaluatedExpressionTooltip = computed(() => altKey.value && active.value);

const wrapperRef = ref<HTMLDivElement>();

const editableHandle = inject('editableHandle') as (expr: CoreExpression.SimpleExpression, path: number[] | undefined) => boolean;
const isEnabled = computed(() => editableHandle(props.modelValue, expressionController.value.getExpressionPath(props.modelValue)));

const handleSelect = () => {
  if (isEnabled.value) {
    activeExpression.value = props.modelValue; 
  }
}

const showDropdown = ref(false);
const dropdownPos = reactive({ x: 0, y: 0 });
const dropdownOptions = computed(() => {
  const parentExpression = expressionController.value.getParentExpression(props.modelValue);
  const parentExpressionChilds = parentExpression ? CoreExpression.retrieveExpressionChilds(parentExpression) : [];
  return [
    {
      key: 'moveNext',
      label: 'Move next',
      icon: renderIcon(ArrowForwardOutline),
      disabled: !parentExpression || parentExpressionChilds.indexOf(props.modelValue) === parentExpressionChilds.length - 1
    },
    {
      key: 'movePrev',
      label: 'Move previous',
      icon: renderIcon(ArrowBackOutline),
      disabled: !parentExpression || parentExpressionChilds.indexOf(props.modelValue) === 0
    },
    {
      type: 'divider',
      key: 'd1'
    },
    {
      key: 'toFunction',
      label: 'Convert to function',
      icon: renderIcon(RefreshOutline),
      disabled: false //!parentExpression || parentExpression.type === 'Identifier'
    },
    {
      key: 'duplicate',
      label: 'Duplicate',
      icon: renderIcon(CopyOutline),
      disabled: !parentExpression
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: renderIcon(TrashOutline),
      disabled: !parentExpression
    }
  ].filter(({ key, type }) => {
    if (type === 'divider') {
      return true;
    }
    else {
      return actions[props.modelValue.type as keyof typeof actions].includes(key);
    }
  });
});
const handleDropdopwnSelect = (value: string) => {
  showDropdown.value = false;
  if (value === 'duplicate') {
    expressionController.value.duplicate(props.modelValue);
  }
  else if (value === 'delete') {
    expressionController.value.delete(props.modelValue);
  }
  else if (value === 'moveNext') {
    const oldActiveExpression = activeExpression.value;
    expressionController.value.moveBy(props.modelValue, 1);
    if (oldActiveExpression !== activeExpression.value) {
      activeExpression.value = oldActiveExpression;
    }
    
  }
  else if (value === 'movePrev') {
    const oldActiveExpression = activeExpression.value;
    expressionController.value.moveBy(props.modelValue, -1);
    if (oldActiveExpression !== activeExpression.value) {
      activeExpression.value = oldActiveExpression;
    }
  }
  else if (value === 'toFunction') {
    if (props.modelValue.type === 'Operation') {
      expressionController.value.toFunction(props.modelValue);
    }
  }
  
}
const handleDropdownClickOutside = (event: MouseEvent) => {
  showDropdown.value = false;
}

const handleContextmenu = (event: MouseEvent) => {
  if (isEnabled.value) {
    event.preventDefault();
    event.stopPropagation();

    const x = event.clientX;//wrapperRef.value ? wrapperRef.value.getBoundingClientRect().left : event.clientX;
    const y = wrapperRef.value ? wrapperRef.value.getBoundingClientRect().bottom : event.clientY;


    dropdownPos.x = x;
    dropdownPos.y = y;
    showDropdown.value = true; 
  }
}


const { handleSortableChoose, handleSortableUnchoose, handleSortableChange, handleSortableUpdate, handleSortableAdd, handleSortableRemove, localState } = useSortableEvents(toRef(props, 'modelValue'), expressionController, activeExpression);


</script>

<style scoped lang="scss">
.general-expression {
  --height: var(--smart-expression-height, 22px);
  --text-offset-y: var(--smart-expression-text-offset-y, 1px);
  --seperator-y: var(--seperator-offset-y, 1px);
  --font-size: var(--smart-expression-font-size, 11px);
  font-size: var(--font-size) !important;
  height: var(--height) !important;
  user-select: none;
  -webkit-user-select: none;
  > * {
    user-select: none;
    -webkit-user-select: none;
  }
  display: inline-grid;
  grid-template-rows: auto auto;
  gap: 2px;
  font-family: monospace;

  .expression-component {
    height: var(--height);
  }
  .active-indicator {
    display: none;
    width: 100%;
    height: 1px;
    background-color: #333;
  }
}
.general-expression.dark-mode {
  .active-indicator {
    background-color: rgba(255, 255, 255, 0.746);
  }
}
.general-expression.disabled {
  
}
.general-expression.context-menu-active, .general-expression.active {
  filter: brightness(0.85);
  outline: 1px solid rgba(0, 0, 0, 0.401);
}
.general-expression.context-menu-active.dark-mode, .general-expression.active.dark-mode {
  filter: brightness(0.85);
  outline: 1px solid rgba(255, 255, 255, 0.65);
}
.identifier-chain:after {
  width: 100%;
  content: '';
  height: 3px;
  border-bottom: 2px solid var(--active-color);
  display: none;
}
.identifier-chain.active:after {
  display: block;
}
</style>

<style lang="scss">
.general-expression-evaluated-value-tooltip {
  background-color: rgb(42, 141, 63) !important;
  .n-popover-arrow-wrapper {
    .n-popover-arrow {
      background-color: rgb(42, 141, 63) !important;
    }
  }
}
.general-expression-evaluated-value-tooltip.error {
  background-color: rgb(194, 46, 46) !important;
  .n-popover-arrow-wrapper {
    .n-popover-arrow {
      background-color: rgb(194, 46, 46) !important;
    }
  }
}
</style>