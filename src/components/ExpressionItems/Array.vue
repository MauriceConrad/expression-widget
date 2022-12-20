<template>
  <div class="array" :class="{ active }" :style="{ '--items-count': items.length }">
    <div class="array-inner">
      <div class="array-opening-bracket" @click="select">
        <div class="array-opening-bracket-start" />
        <div class="array-opening-bracket-middle">
          <span>ARRAY</span>
        </div>
        <div class="array-opening-bracket-end" />
      </div>
      <div ref="arrayItemsRef" class="array-items">
        <div v-for="item, index in items" :key="hash({ index, state })" class="item">
          <div class="seperator no-drag">
            <span>,</span>
          </div>
          <GeneralExpression :model-value="item" />
          <!-- <div v-else class="actions">

          </div> -->
        </div>
      </div>
      <div class="array-closing-bracket" @click="select">
        <div class="array-closing-bracket-start" />
        <div class="array-closing-bracket-middle" />
        <div class="array-closing-bracket-end" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export const actions = ['delete', 'duplicate', 'toFunction', 'moveNext', 'movePrev'];
</script>


<script setup lang="ts">
import { SimpleExpression, ExpressionController } from '../../controllers/expression'
import GeneralExpression from './GeneralExpression.vue';
import { ref, Ref, inject } from 'vue'
import useDrag from './controllers/drag'
import hash from '../../util/hash'

const props = defineProps<{
  active: boolean;
  items: SimpleExpression[];
  state?: string;
}>();
const emit = defineEmits(['select', 'sortable:change', 'sortable:update', 'sortable:add', 'sortable:remove']);

const select = () => {
  emit('select');
};

const arrayItemsRef = ref<HTMLDivElement>();


const { sortable } = useDrag(arrayItemsRef, {
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
});

</script>

<style scoped lang="scss">
.array {
  color: #fff;
  --background-color: rgb(230, 35, 152);
  .array-inner {
    display: grid;
    grid-template-columns: repeat(3, auto);
    .array-opening-bracket {
      height: var(--height);
      display: grid;
      grid-template-columns: repeat(3, auto);
      > div {
        background-color: var(--background-color);
      }
      .array-opening-bracket-start {
        width: calc(var(--height) / 2);
        box-sizing: border-box;
        -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gNTAsMCBBIDUwLDUwIDAgMSAwIDUwLDEwMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
        mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gNTAsMCBBIDUwLDUwIDAgMSAwIDUwLDEwMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
      }
      .array-opening-bracket-middle {
        width: auto;
        display: grid;
        place-items: center;
        padding: 0 5px 0 0;
      }
      .array-opening-bracket-end {
        width: calc(var(--height) / 2);
        box-sizing: border-box;
        -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEwgNTAsMCBBIDUwLDUwIDAgMSAwIDUwLDEwMCBMIDAsMTAwIiBzdHlsZT0iZmlsbDogI2ZmZjsiIC8+Cjwvc3ZnPg==');
        mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEwgNTAsMCBBIDUwLDUwIDAgMSAwIDUwLDEwMCBMIDAsMTAwIiBzdHlsZT0iZmlsbDogI2ZmZjsiIC8+Cjwvc3ZnPg==');
      }

    }
    .array-closing-bracket {
      height: var(--height);
      display: grid;
      grid-template-columns: repeat(3, auto);
      > div {
        background-color: var(--background-color);
      }
      .array-closing-bracket-start {
        width: calc(var(--height) / 2);
        box-sizing: border-box;
        -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAgTCA1MCwxMDAgNTAsMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
        mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAgTCA1MCwxMDAgNTAsMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');

      }
      .array-closing-bracket-middle {
        width: 5px;
        
      }
      .array-closing-bracket-end {
        width: calc(var(--height) / 2);
        box-sizing: border-box;
        -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAiIHN0eWxlPSJmaWxsOiAjZmZmOyIgLz4KPC9zdmc+');
        mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAiIHN0eWxlPSJmaWxsOiAjZmZmOyIgLz4KPC9zdmc+');
        
      }
    }
  }
}
.array-items {
  display: grid;
  grid-auto-flow: column;
  .item {
    
    .seperator {
      
    }
  }
  > * {

  }
  // ::v-deep(> *:last-child) {
  //   .seperator {
  //     display: none;
  //   }
  // }
}
.array.active {
  --background-color: rgb(200, 26, 130);
}
</style>

<style lang="scss">
.array-items {
  > div {
    display: grid;
    grid-template-columns: repeat(3, auto);
    > .seperator {
      color: #000;
      display: grid;
      place-items: center end;
      padding: 0 3px;
      display: none;
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