<template>
  <div class="value-view">
    <n-tabs v-model:value="tab">
      <n-tab-pane name="number" tab="Number">
        <n-card>
          <NumberWidget v-model="numberProxy" />
        </n-card>
      </n-tab-pane>
      <n-tab-pane name="string" tab="String">
        <StringWidget v-model="strProxy" />
      </n-tab-pane>
      <n-tab-pane name="boolean" tab="Boolean">
        <n-card>
          <BooleanWidget v-model="boolProxy" />
        </n-card>
      </n-tab-pane>
      <n-tab-pane name="object" tab="Object">
        <n-card class="card-without-padding">
          <ObjectWidget v-model="objProxy" />
        </n-card>
      </n-tab-pane>
    </n-tabs>
    <div v-if="!expressionIsLiteralAndCorrectTypeIsSelected" class="actions">
      <n-space justify="end">
        <n-button size="small" type="default" round @click="updateValue">
          Update
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NTabs, NTabPane, NSpace, NButton, NCard } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { Expression as CoreExpression } from '@bluepic/core'
import NumberWidget from './ValueWidgets/NumberWidget.vue'
import StringWidget from './ValueWidgets/StringWidget.vue'
import BooleanWidget from './ValueWidgets/BooleanWidget.vue'
import ObjectWidget from './ValueWidgets/ObjectWidget.vue'

type ValueTypes = 'number' | 'string' | 'boolean' | 'object' | 'null' | 'undefined' | 'bigint' | 'symbol' | 'function';

const props = defineProps<{
  expression: CoreExpression.SimpleExpression | undefined;
}>();
const emit = defineEmits(['update:expression']);

const tab = ref<ValueTypes>('number');

const initTab = () => {
  if (props.expression?.type === 'Literal') {
    tab.value = typeof props.expression.value;
  }
  else if (props.expression?.type === 'Object') {
    tab.value = 'object';
  }
}
initTab();
watch(() => props.expression, initTab);

// This declares wthere the current expression's value is excatly of the type we're currently editing (tabs) 
// This should be used to activate auto syncing instead of syncing via user-gesture which makes sense if this triggers a type change or overwrites an identifier with the value 
const expressionIsLiteralAndCorrectTypeIsSelected = computed(() => {
  if (props.expression?.type === 'Literal') {
    return tab.value ===  typeof props.expression.value;
  }
  else {
    return false;
  }
});

const currNewValue = ref<any>();
const numberProxy = computed({
  get() {
    if (props.expression?.type === 'Literal') {
      if (typeof props.expression.value === 'number' && !isNaN(props.expression.value)) {
        return props.expression.value;
      }
    }
  },
  set(newValue) {
    currNewValue.value = newValue;
  }
});

const strProxy = computed({
  get() {
    if (props.expression?.type === 'Literal') {
      if (typeof props.expression.value === 'string') {
        return props.expression.value;
      }
    }
  },
  set(newValue) {
    currNewValue.value = newValue;
  }
});

const boolProxy = computed({
  get() {
    if (props.expression?.type === 'Literal') {
      if (typeof props.expression.value === 'boolean') {
        return props.expression.value;
      }
    }
  },
  set(newValue) {
    currNewValue.value = newValue;
  }
});

const objProxy = computed({
  get() {
    if (props.expression?.type === 'Object') {
      return CoreExpression.ExpressionController.toString(props.expression);
    }
  },
  set(newValue) {
    currNewValue.value = newValue;
  }
});

watch(currNewValue, () => {
  if (expressionIsLiteralAndCorrectTypeIsSelected.value) {
    updateValue();
  }
});
const updateValue = () => {
  const exprStr = props.expression?.type === 'Object' ? `(${ currNewValue.value })` : JSON.stringify(currNewValue.value);
  const expr = CoreExpression.parseExpr(exprStr);
  emit('update:expression', expr);
}


</script>

<style scoped lang="scss">
.card-without-padding {
  ::v-deep(.n-card__content) {
    padding: 0;
  }
}
.actions {
  margin-top: 10px;
}
</style>