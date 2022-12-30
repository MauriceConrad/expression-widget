<template>
  <div class="unparsed" :class="{ active }" @click="select">
    <div class="unparsed-inner">
      <span>UNPARSED</span>
    </div>
  </div>
</template>

<script lang="ts">
export const actions = ['delete', 'duplicate', 'moveNext', 'movePrev'];
</script>

<script setup lang="ts">
import { Expression, SpreadElement } from 'estree'


const props = defineProps<{
  active: boolean;
  estreeExpression: Expression | SpreadElement;
  raw?: string;
}>();
const emit = defineEmits(['select']);

const select = () => {
  emit('select');
};

</script>

<style scoped lang="scss">
.unparsed {
  --background-color: rgb(238, 197, 107);
  .unparsed-inner {
    background-color: var(--background-color);
    border-radius: 15px;
    height: var(--height);
    padding: 0 10px;
    display: grid;
    place-items: center;
  }
}
.unparsed.active {
  --background-color: rgb(209, 173, 96);
}


</style>