<template>
  <div class="literal draggable" :class="{ ['type-' + type]: true, active }" @click="select">
    <div class="value-wrapper">
      <span>
        {{ valueStr }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
export const actions = ['delete', 'duplicate', 'moveNext', 'movePrev'];
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  value: string | number | boolean | null | undefined;
  raw: string;
  active: boolean;
}>();
const emit = defineEmits(['update:raw', 'update:value', 'select']);

const type = computed(() => {
  if (props.value === null) {
    return 'null';
  }
  else {
    return typeof props.value;
  }
});


const valueStr = computed(() => {
  return String(props.value);
});

const select = () => {
  emit('select');
}

</script>

<style scoped lang="scss">
.literal {
  display: inline-block;
  border-radius: calc(var(--height) / 2);
  height: var(--height);
  padding: 0 calc(var(--height) / 2);
  background-color: rgb(215, 215, 215);
  .value-wrapper {
    display: grid;
    place-items: center;
    height: 100%;
    > span {
      position: relative;
      top: var(--text-offset-y);
    }
  }
}
.literal.type-string {
  background-color: rgb(26, 145, 66);
  color: #fff;
}
.literal.type-string.active {
  background-color: rgb(19, 108, 48);
}
.literal.type-number {
  background-color: rgb(241, 145, 41);
  color: #fff;
}
.literal.type-number.active {
  background-color: rgb(189, 115, 34);
}
.literal.type-boolean {
  background-color: rgb(146, 0, 146);
  color: #fff;
}
.literal.type-boolean.active {
  background-color: rgb(92, 2, 92);
}
.literal.type-null {
  background-color: rgb(61, 61, 61);
  color: #fff;
}
.literal.type-null.active {
  background-color: rgb(39, 39, 39);
}
.literal.type-undefined {
  background-color: rgb(13, 13, 13);
  color: #fff;
}
.literal.type-undefined {
  background-color: rgb(0, 0, 0);
}

</style>