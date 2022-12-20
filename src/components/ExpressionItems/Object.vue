<template>
  <div class="object" :class="{ active }" @click="select">
    <div class="object-inner">
      <span>OBJECT</span>
    </div>
  </div>
</template>

<script lang="ts">
export const actions = ['delete', 'duplicate', 'moveNext', 'movePrev'];
</script>

<script setup lang="ts">
import { SimpleExpression } from '../../controllers/expression'


const props = defineProps<{
  active: boolean;
  properties: {
    key: string;
    value: SimpleExpression;
    range?: [number, number];
  }[];
}>();
const emit = defineEmits(['select']);

const select = () => {
  emit('select');
};

</script>

<style scoped lang="scss">
.object {
  --background-color: rgb(238, 197, 107);
  .object-inner {
    background-color: var(--background-color);
    border-radius: 15px;
    height: var(--height);
    padding: 0 10px;
    display: grid;
    place-items: center;
  }
}
.object.active {
  --background-color: rgb(209, 173, 96);
}


</style>