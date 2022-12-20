<template>
  <div class="number-widget">
    <n-input-number v-model:value="value" />
  </div>
</template>


<script setup lang="ts">
import { NInputNumber } from 'naive-ui'
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue?: number;
}>();
const emit = defineEmits(['update:model-value']);

const value = ref(props.modelValue);
watch(() => props.modelValue, () => {
  value.value = props.modelValue;
});
watch(value, newValue => {
  if (newValue !== props.modelValue) {
    emit('update:model-value', newValue);
  }
})

</script>

<style scoped lang="scss">
.number-widget {
  min-height: 80px;
  display: grid;
  place-items: center;
  .n-input-number {
    max-width: 600px;
  }
}
</style>