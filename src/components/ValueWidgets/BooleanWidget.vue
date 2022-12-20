<template>
  <div class="boolean-widget">
    <div>
      <n-switch v-model:value="value" :rail-style="railStyle">
        <template #checked>
          true
        </template>
        <template #unchecked>
          false
        </template>
      </n-switch>
    </div>
  </div>
</template>


<script setup lang="ts">
import { NSwitch } from 'naive-ui'
import { CSSProperties, ref, watch } from 'vue'

const props = defineProps<{
  modelValue?: boolean;
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

const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
  const style: CSSProperties = {}
  if (checked) {
    style.backgroundColor = 'rgb(146, 0, 146)'
    if (focused) {
      style.boxShadow = '0 0 0 2px #d0305040'
    }
  } else {
    style.backgroundColor = 'rgb(141, 93, 156)'
    if (focused) {
      style.boxShadow = '0 0 0 2px #2080f040'
    }
  }
  return style
}

</script>

<style scoped lang="scss">
.boolean-widget {
  min-height: 80px;
  display: grid;
  place-items: center;
  gap: 10px;
  .n-input-number {
    max-width: 600px;
  }
  > div {
    display: grid;
    place-items: center;
  }
  --a: rgb(141, 93, 156);
}
</style>