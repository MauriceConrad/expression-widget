<template>
  <div class="call" :style="{ '--arguments-count': argsCount }" :class="{ 'dark-mode': isDarkMode }">
    <IdentifierChain v-if="identifier" :members="identifier" head :active="active" color="rgb(66, 114, 211)" color-active="rgb(42, 78, 152)" text-color="#fff" @select="select">
      <template #head>
        <div ref="argumentsListRef" class="arguments-list" :class="{ 'is-empty': argsCount === 0 }">
          <div v-if="argsCount > 0" v-for="arg, index in arguments" :key="hash({index, state})" class="argument-wrapper">
            <div class="seperator no-drag">
              <span>,</span>
            </div>
            <GeneralExpression :model-value="arg" />
            <!-- <div v-else class="actions"></div> -->
          </div>
        </div>
      </template>
    </IdentifierChain>
  </div>
</template>


<script lang="ts">
export const actions = ['delete', 'duplicate', 'moveNext', 'movePrev'];
</script>

<script setup lang="ts">
import { watchEffect, computed, ref, onMounted, Ref, inject, toRef } from 'vue'
import { Expression as CoreExpression } from '@bluepic/core'
import GeneralExpression from './GeneralExpression.vue'
import IdentifierChain from './IdentifierChain.vue'
import useDrag from './controllers/drag'
import hash from '../../util/hash'

const props = defineProps<{
  body?: string;
  identifier?: CoreExpression.SimpleExpressionIdentifier['identifier'];
  arguments: CoreExpression.SimpleExpression[];
  active: boolean;
  state?: string;
}>();

const emit = defineEmits(['select', 'sortable:choose', 'sortable:unchoose', 'sortable:change', 'sortable:update', 'sortable:add', 'sortable:remove']);

const argumentsListRef = ref<HTMLDivElement>();

const isDarkMode = inject('isDarkMode') as Ref<boolean>;

const argsCount = computed(() => {
  return props.arguments.length;
});


const select = () => {
  emit('select');
}

const { sortable } = useDrag(argumentsListRef, {
  onChoose(event) {
    emit('sortable:choose', event);
  },
  onUnchoose(event) {
    emit('sortable:unchoose', event);
  },
  onChange(event) {
    emit('sortable:change', event);
  },
  onUpdate(event) {
    emit('sortable:update', event);
  },
  onAdd(event) {
    emit('sortable:add', event);
  },
  onRemove(event) {
    emit('sortable:remove', event);
  },
  // setData(dataTransfer) {
  //   dataTransfer.setData('Text', dragEl.textContent);
  // }
});


</script>

<style scoped lang="scss">
.call {
  --tets: rgb(200, 98, 98);
  //--seperator-y: 3px;
  .arguments-list {
    min-height: var(--height);
    // display: grid;
    // grid-template-columns: repeat(var(--arguments-count), auto);
    display: grid;
    grid-auto-flow: column;
    gap: 0px;
    .empty-slogan {
      display: grid;
      place-items: center;
      opacity: 0.6;
      font-weight: 300;
      font-size: 0.8em;
      color: #000;
    }
    .argument-wrapper {
      
      .seperator {
        position: relative;
        top: var(--seperator-y);
      }
    }
    
  }
  .arguments-list.is-empty {
    min-width: 20px;
  }
  // .arguments-list.is-empty:after {
  //   color: #000;
  //   opacity: 0.6;
  //   content: 'empty';
  //   width: auto;
  //   height: auto;
  //   display: inline-block;
  //   font-size: 0.8em;
  //   vertical-align: middle;
  //   --height: calc(0.8em * 1.8);
  //   height: var(--height);
  //   position: relative;
  //   top: calc(50% - var(--height) / 2)
  // }
  
  .name {

  }
  .args {

  }
}
.dark-mode {
  .arguments-list {
    .argument-wrapper {
      .seperator {
        color: #fff;
      }
    }
  }
}
.call.disabled {
  ::v-deep(> .identifier-chain) {
    > .member {
      opacity: 0.5;
      cursor: not-allowed;
    }
    > .head {
      > .head-start {
        opacity: 0.5;
        cursor: not-allowed;
      }
      > .head-end {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>

<style lang="scss">
.arguments-list {
  
  > div {
    display: grid;
    grid-template-columns: repeat(2, auto);
    place-items: start center;
    > .seperator {
      color: #000;
      height: var(--height);
      display: none;
      place-items: center end;
      padding-right: 3px;
      padding-left: 3px;
      color: #000;
      position: relative;
      top: var(--seperator-offset-y);
    }
  }
  > div + div {
    > .seperator {
      display: grid;
    }
  }
}
</style>