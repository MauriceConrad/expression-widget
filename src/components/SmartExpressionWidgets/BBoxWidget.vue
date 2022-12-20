<template>
  <div class="bbox-widget">
    <div class="widget">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <rect :x="5" :y="5" :width="90" :height="90" style="fill: rgba(0, 0, 0, 0.05);" />
        <rect :x="10" :y="15" :width="5" :height="70" style="fill: rgba(0, 0, 0, 0.05);" />
        <rect :x="85" :y="15" :width="5" :height="70" style="fill: rgba(0, 0, 0, 0.05);" />
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
export function isValid(item: AutocompleteItem) {
  const memberNames = getMemberNames(item);
  //return memberNames?.includes('width') && memberNames.includes('height');
  return false;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { AutocompleteItem, getMemberNames } from '../../controllers/autocomplete'


const props = defineProps<{
  item: AutocompleteItem;
}>();

const memberNames = computed(() => getMemberNames(props.item));

</script>

<style scoped lang="scss">
.bbox-widget {
  height: 100%;
}
.widget {
  height: 100%;
  > svg {
    width: 200px !important;
    height: 100% !important;
  }
}

</style>