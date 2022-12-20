<template>
  <div class="operation" :class="{ active }">
    <div v-if="operands.length >= 2" class="binary-operation">
      <!-- <div class="bracket bracket-left" /> -->
      <div class="bracket bracket-left" @click="select">
        <div class="bracket-left-start" />
        <div class="bracket-left-middle" />
        <div class="bracket-left-end" />
      </div>
      <div class="operand operand-left">
        <GeneralExpression v-model="leftOperandProxy" />
      </div>
      <div class="operator" @click="select">
        <div class="operator-wrapper">
          <span>{{ operator }}</span>
        </div>
      </div>
      <div class="operand operand-right">
        <GeneralExpression v-model="rightOperandProxy" />
      </div>
      <!-- <div class="bracket bracket-right" /> -->
      <div class="bracket bracket-right" @click="select">
        <div class="bracket-right-start" />
        <div class="bracket-right-middle" />
        <div class="bracket-right-end" />
      </div>
    </div>
    <div v-else class="unary-operation">
      <div class="bracket bracket-left" @click="select">
        <div class="bracket-left-start" />
        <div class="bracket-left-middle">
          <span class="operator">
            {{ operator }}
          </span>
        </div>
        <div class="bracket-left-end" />
      </div>
      <div class="operand operand-right">
        <GeneralExpression v-model="operandProxy" />
      </div>
      <div class="bracket bracket-right" @click="select">
        <div class="bracket-right-start" />
        <div class="bracket-right-middle" />
        <div class="bracket-right-end" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export const actions = ['delete', 'duplicate', 'toFunction', 'moveNext', 'movePrev'];
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SimpleExpression } from '../../controllers/expression'
import GeneralExpression from './GeneralExpression.vue'


const props = defineProps<{
  operands: SimpleExpression[];
  operator: string;
  active: boolean;
}>();
const emit = defineEmits(['update:operands', 'update:operator', 'select']);


const leftOperandProxy = computed({
  get() {
    return props.operands[0];
  },
  set(newOperand) {
    emit('update:operands', [ newOperand, props.operands[1] ]);
  }
});
const rightOperandProxy = computed({
  get() {
    return props.operands[1];
  },
  set(newOperand) {
    emit('update:operands', [ props.operands[0], newOperand ]);
  }
});

const operandProxy = computed({
  get() {
    return props.operands[0];
  },
  set(newOperand) {
    emit('update:operands', [ newOperand ]);
  }
});

const select = () => {
  emit('select');
};

defineExpose({

});

</script>

<style scoped lang="scss">
.operation {
  display: inline-block;
  font-family: monospace;
  --background-color: rgb(240, 102, 102);
  --border-color: rgba(0, 0, 0, 0);
}
.operation.active {
  --background-color: rgb(200, 98, 98);
  --border-color: rgba(0, 0, 0, 0.1);
}
.binary-operation, .unary-operation {
  display: inline-block;
  display: grid;
  gap: 5px;
}
.binary-operation {
  grid-template-columns: repeat(5, auto);
}
.unary-operation {
  grid-template-columns: repeat(3, auto);
}
// .bracket {
//   --bracket-thickeness: 3px;
//   --backet-color: rgb(215, 215, 215);
//   width: 5px;
//   border-bottom: var(--bracket-thickeness) solid var(--backet-color);
//   border-top: var(--bracket-thickeness) solid var(--backet-color);
// }
// .bracket-left {
//   border-left: var(--bracket-thickeness) solid var(--backet-color);
// }
// .bracket-right {
//   border-right: var(--bracket-thickeness) solid var(--backet-color);
// }
.bracket {

}
.bracket-left {
  cursor: pointer;
  display: grid;
  grid-template-columns: repeat(3, auto);
  .bracket-left-start {
    width: calc(var(--height) / 2);
    background-color: var(--background-color);
    box-sizing: border-box;
    -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gNTAsMCBBIDUwLDUwIDAgMSAwIDUwLDEwMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
    mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gNTAsMCBBIDUwLDUwIDAgMSAwIDUwLDEwMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
  }
  .bracket-left-middle {
    min-width: 5px;
    width: auto;
    font-size: 1em;
    background-color: var(--background-color);
    box-sizing: border-box;
  }
  .bracket-left-end {
    width: calc(var(--height) / 2);
    background-color: var(--background-color);
    box-sizing: border-box;
    -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEwgNTAsMCBBIDUwLDUwIDAgMSAwIDUwLDEwMCBMIDAsMTAwIiBzdHlsZT0iZmlsbDogI2ZmZjsiIC8+Cjwvc3ZnPg==');
    mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEwgNTAsMCBBIDUwLDUwIDAgMSAwIDUwLDEwMCBMIDAsMTAwIiBzdHlsZT0iZmlsbDogI2ZmZjsiIC8+Cjwvc3ZnPg==');
  }
}
.bracket-right {
  cursor: pointer;
  display: grid;
  grid-template-columns: repeat(3, auto);
  .bracket-right-start {
    width: calc(var(--height) / 2);
    background-color: var(--background-color);
    box-sizing: border-box;
    -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAgTCA1MCwxMDAgNTAsMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
    mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAgTCA1MCwxMDAgNTAsMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
  }
  .bracket-right-middle {
    width: 5px;
    background-color: var(--background-color);
    box-sizing: border-box;
  }
  .bracket-right-end {
    width: calc(var(--height) / 2);
    background-color: var(--background-color);
    box-sizing: border-box;
    -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAiIHN0eWxlPSJmaWxsOiAjZmZmOyIgLz4KPC9zdmc+');
    mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAiIHN0eWxlPSJmaWxsOiAjZmZmOyIgLz4KPC9zdmc+');
  }
}
.operand {
  cursor: pointer;
  height: var(--height);
  padding: 0 0px;
  display: grid;
  place-items: center;
  
}
.unary-operation {
  .bracket-left-middle {
    width: auto !important;
    .operator {
      padding: 0 8px 0 0px;
      color: #fff;
    }
  }
}
.operand-left {
  //border-radius: 8px 0 0 8px;
}
.operand-right {
  //border-radius: 0 8px 8px 0;
}
.operator {
  height: var(--height);
  padding: 0 10px;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  
  > .operator-wrapper {
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    box-sizing: border-box;
    color: #fff;
    width: 16px;
    height: 100%;
    display: grid;
    place-items: center;
    border-radius: 0px;
  }
  
}
</style>