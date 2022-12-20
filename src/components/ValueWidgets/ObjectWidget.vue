<template>
  <div class="object-widget">
    <div ref="flaskRef" class="flask-wrapper" />
  </div>
</template>


<script setup lang="ts">
import { NSwitch } from 'naive-ui'
import { computed, CSSProperties, onMounted, ref, watch } from 'vue'
import CodeFlask from 'codeflask'
import beautify from 'js-beautify'

const props = defineProps<{
  modelValue?: string;
}>();
const emit = defineEmits(['update:model-value']);


const codeflask = ref<CodeFlask>();

const beautifyCode = (code: string) => {
  return beautify(code, { indent_size: 2, space_in_empty_paren: true })
}

const setValue = () => {
  if (codeflask.value) {
    if (props.modelValue) {
      codeflask.value.updateCode(beautifyCode(props.modelValue));
    }
    else {
      codeflask.value.updateCode('{\n}')
    }
  }
}
watch(() => props.modelValue, () => {
  if (props.modelValue && codeflask.value && beautifyCode(props.modelValue) !== beautifyCode(codeflask.value.getCode())) {
    setValue();
  }
});

const flaskRef = ref<HTMLDivElement>();
onMounted(() => {
  if (flaskRef.value) {
    codeflask.value = new CodeFlask(flaskRef.value, {
      language: 'js',
      defaultTheme: true
    });
    codeflask.value.onUpdate(() => {
      emit('update:model-value', codeflask.value?.getCode());
    });
    setValue();
  }
});


</script>

<style scoped lang="scss">
.object-widget {
  min-height: 80px;
  box-sizing: border-box;
  
}
</style>