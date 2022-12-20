<template>
  <div class="expression-widget">
    <GeneralExpression :key="renderState" v-model="modelValueProxy" />
  </div>
</template>


<script setup lang="ts">
import { computed, provide, Ref, ref, watch, watchEffect } from 'vue'
import { SimpleExpression, ExpressionController } from '../controllers/expression'
import GeneralExpression from './ExpressionItems/GeneralExpression.vue'
import uniqid from 'uniqid'

const props = defineProps<{
  modelValue: SimpleExpression;
  activeExpression: SimpleExpression | undefined;
}>();
const emit = defineEmits(['update:model-value', 'update:active-expression']);

const renderState = ref(uniqid());

const expressionController = ref<ExpressionController>();
const initExpressionController = () => {
  expressionController.value?.removeAllListeners();
  expressionController.value = new ExpressionController(props.modelValue);
  expressionController.value.on('update', (rootExpression: SimpleExpression) => {
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

const activeExpression = (() => {
  const activeExpressionPath = ref<number[]>();
  return computed({
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
})();
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

defineExpose({
  expressionController
});

</script>