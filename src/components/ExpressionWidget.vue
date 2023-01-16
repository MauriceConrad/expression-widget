<template>
  <div class="expression-widget">
    <GeneralExpression :key="renderState" v-model="modelValueProxy" />
  </div>
</template>


<script setup lang="ts">
import { computed, provide, Ref, ref, watch, watchEffect } from 'vue'
import { Expression as CoreExpression } from '@bluepic/core'
import GeneralExpression from './ExpressionItems/GeneralExpression.vue'
import uniqid from 'uniqid'

const props = defineProps<{
  modelValue: CoreExpression.SimpleExpression;
  editableHandle: (expr: CoreExpression.SimpleExpression, path: number[] | undefined) => boolean;
  //activeExpression: SimpleExpression | undefined;
}>();
const emit = defineEmits(['update:model-value', 'update:active-expression']);

const renderState = ref(uniqid());

provide('editableHandle', props.editableHandle);

const expressionController = ref<CoreExpression.ExpressionController>();
const initExpressionController = () => {
  expressionController.value?.removeAllListeners();
  expressionController.value = new CoreExpression.ExpressionController(props.modelValue);
  expressionController.value.on('update', (rootExpression: CoreExpression.SimpleExpression) => {
    modelValueProxy.value = rootExpression;
  });
  expressionController.value.on('rerender', () => {
    renderState.value = uniqid();
  });
};
initExpressionController();
watch(() => props.modelValue, initExpressionController);
provide('expressionController', expressionController);


const modelValueProxy = computed({
  get() {
    return props.modelValue;
  },
  set(newExpr) {
    emit('update:model-value', newExpr);
  }
});

const activeExpressionPath = ref<number[]>();
const activeExpression = computed({
  get() {
    if (expressionController.value && activeExpressionPath.value) {
      return expressionController.value.retrieveExpressionByPath(activeExpressionPath.value);
    }
  },
  set(newActiveExpression) {
    if (expressionController.value) {
      activeExpressionPath.value = expressionController.value.getExpressionPath(newActiveExpression as any);
    }
  }
});


// const activeExpression = computed({
//   get() {
//     if (expressionController.value) {
//       return expressionController.value.activeExpression;
//     }
//   },
//   set(newActiveExpression) {
//     if (expressionController.value) {
//       expressionController.value.activeExpression = newActiveExpression;
//     }
//   }
// });
provide('activeExpression', activeExpression);
watchEffect(() => {
  emit('update:active-expression', activeExpression.value);
});
// watchEffect(() => {
//   emit('update:active-expression-path', activeExpressionPath.value);
// });

defineExpose({
  expressionController
});

</script>