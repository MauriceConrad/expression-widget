<template>
  <div class="identifier" :style="{ '--members-count': identifierSafe.length }">
    <IdentifierChain :members="identifier" @select="select" :active="active" />
  </div>
</template>

<script lang="ts">
export const actions = ['delete', 'duplicate', 'moveNext', 'movePrev'];
</script>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { Expression as CoreExpression} from '@bluepic/core'
import GeneralExpression from './GeneralExpression.vue'
import IdentifierChain from './IdentifierChain.vue';

const props = defineProps<{
  identifier: CoreExpression.SimpleExpressionIdentifier['identifier'];
  active: boolean;
}>();
const emit = defineEmits(['update:identifier', 'select']);

watchEffect(() => {
  console.log('IDENTIFIER', props.identifier);
  
});

const identifierSafe = computed(() => {
  return props.identifier.filter(identifier => identifier !== undefined) as (CoreExpression.SimpleExpressionIdentifierStatic | CoreExpression.SimpleExpressionIdentifierExpression)[];
});

const select = () => {
  emit('select');
}

</script>

<style scoped lang="scss">
.identifier {
  display: inline-block;
  
  
}

</style>