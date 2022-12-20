<template>
  <div class="string-widget">
    <n-input v-model:value="value" type="textarea" :resizable="false" />
  </div>
</template>


<script setup lang="ts">
import { NInputNumber, NInput } from 'naive-ui'
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue?: string;
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
});

</script>

<style scoped lang="scss">
.string-widget {
  height: calc(80px + 40px);
  display: grid;
  place-items: center;
  .n-input {
    max-width: 600px;
    height: 100%;
  }
}
</style>