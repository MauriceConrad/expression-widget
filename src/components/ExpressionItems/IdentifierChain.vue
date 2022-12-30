<template>
  <div class="identifier-chain" :class="{ 'has-head': head, active }" :style="{ '--members-count': identifierSafe.length, '--color': color, '--color-active': colorActive, '--text-color': textColor }" @click="select">
    <div v-for="member, index in identifierSafe" class="member">
      <template v-if="member.type === 'expression'">
        <GeneralExpression :model-value="member.expression" @click="preventSelect" />
        <div v-if="identifierSafe[index + 1] && identifierSafe[index + 1].type === 'static'" class="last-expression-member-bracket">
          <div class="last-expression-member-bracket-start" />
          <div class="last-expression-member-bracket-middle" />
        </div>
        <div v-if="index < identifierSafe.length - 1" class="chain-symbol">
          <link-outline />
        </div>
        <div v-else class="last-member-bracket-expression">
          <div class="last-member-bracket-expression-start" />
          <div class="last-member-bracket-expression-middle" />
          <div class="last-member-bracket-expression-end" />
        </div>
      </template>
      <template v-else>
        <div class="member-chain" :class="{ 'member-chain-left': index === 0, 'member-chain-right': index === identifierSafe.length - 1 }">
          <span>{{ member.name }}</span>
        </div>
        <div v-if="index < identifierSafe.length - 1" class="chain-symbol">
          <link-outline />
        </div>
        <div v-if="identifierSafe[index + 1] && identifierSafe[index + 1].type === 'expression'" class="last-static-member-bracket">
          <div class="last-static-member-bracket-middle" />
          <div class="last-static-member-bracket-end" />
        </div>
        <div v-if="index === identifierSafe.length - 1 && !head" class="last-member-bracket-static">
          <div class="last-member-bracket-static-middle" />
          <div class="last-member-bracket-static-end" />
        </div>
      </template>
    </div>
    <div v-if="head" class="head">
      <div class="head-start">
        <div class="head-start-middle" />
        <div class="head-start-end" />
      </div>
      <div class="head-inner" @click="preventSelect">
        <slot name="head" />
      </div>
      <div class="head-end">
        <div class="head-end-start" />
        <div class="head-end-middle" />
        <div class="head-end-end" />
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { Expression as CoreExpression } from '@bluepic/core'
import { computed } from 'vue'
import { LinkOutline } from '@vicons/ionicons5'
import GeneralExpression from './GeneralExpression.vue'

const props = withDefaults(defineProps<{
  members: CoreExpression.SimpleExpressionIdentifier['identifier'];
  head?: boolean;
  active: boolean;
  color?: string;
  colorActive?: string;
  textColor?: string;
}>(), {
  head: false,
  color: 'rgb(215, 215, 215)',
  colorActive: 'rgb(180, 180, 180)',
  textColor: '#000'
});


const emit = defineEmits(['select']);
const identifierSafe = computed(() => {
  return props.members.filter(identifier => identifier !== undefined) as (CoreExpression.SimpleExpressionIdentifierStatic | CoreExpression.SimpleExpressionIdentifierExpression)[];
});

const preventSelect = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
}

const select = (event: MouseEvent) => {
  emit('select');
}
</script>


<style scoped lang="scss">
.identifier-chain {
  display: grid;
  grid-template-columns: repeat(var(--members-count), auto);
  --background-color: var(--color);
  color: var(--text-color);
  .member {
    display: grid;
    grid-template-columns: auto auto auto;
    > * {
      
      height: 100%;
    }
    .member-chain {
      display: grid;
      place-items: center;
      background-color: var(--background-color);
      height: var(--height);
      padding: 0 5px;
      > span {
        top: var(--text-offset-y);
      }
    }
    .member-chain-left {
      border-radius: calc(var(--height) / 2) 0 0 calc(var(--height) / 2);
      padding-left: 0px;
      padding: 0 5px 0 calc(var(--height) / 2);
    }
    .member-chain-right {
      
      padding-right: 0px;
      
    }
    .member-chain-left.member-chain-right {
      padding: 0 calc(var(--height) / 4) 0 calc(var(--height) / 2);
      padding-right: 0;
    }

    .chain-symbol {
      font-size: 12px;
      width: 16px;
      display: grid;
      place-items: center;
      height: var(--height);
      background-color: var(--background-color);
    }
    .last-member-bracket-expression {
      display: grid;
      grid-template-columns: repeat(3, auto);
      height: var(--height);
      .last-member-bracket-expression-start {
        width: calc(var(--height) / 2);
        background-color: var(--background-color);
        -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAgTCA1MCwxMDAgNTAsMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
        mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAgTCA1MCwxMDAgNTAsMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
      }
      .last-member-bracket-expression-middle {
        width: 5px;
        background-color: var(--background-color);
      }
      .last-member-bracket-expression-end {
        width: calc(var(--height) / 2);
        background-color: var(--background-color);
        -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAiIHN0eWxlPSJmaWxsOiAjZmZmOyIgLz4KPC9zdmc+');
        mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAiIHN0eWxlPSJmaWxsOiAjZmZmOyIgLz4KPC9zdmc+');
      }
    }
    .last-member-bracket-static {
      display: grid;
      grid-template-columns: repeat(2, auto);
      height: var(--height);
      .last-member-bracket-static-middle {
        width: 0px;
        background-color: var(--background-color);
      }
      .last-member-bracket-static-end {
        width: calc(var(--height) / 2);
        background-color: var(--background-color);
        -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAiIHN0eWxlPSJmaWxsOiAjZmZmOyIgLz4KPC9zdmc+');
        mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAiIHN0eWxlPSJmaWxsOiAjZmZmOyIgLz4KPC9zdmc+');
      }
    }
    .last-static-member-bracket {
      height: var(--height);
      display: grid;
      grid-template-columns: repeat(2, auto);
      .last-static-member-bracket-middle {
        width: 5px;
        background-color: var(--background-color);
      }
      .last-static-member-bracket-end {
        width: calc(var(--height) / 2);
        background-color: var(--background-color);
        -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEwgNTAsMCBBIDUwLDUwIDAgMSAwIDUwLDEwMCBMIDAsMTAwIiBzdHlsZT0iZmlsbDogI2ZmZjsiIC8+Cjwvc3ZnPg==');
        mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEwgNTAsMCBBIDUwLDUwIDAgMSAwIDUwLDEwMCBMIDAsMTAwIiBzdHlsZT0iZmlsbDogI2ZmZjsiIC8+Cjwvc3ZnPg==');
      }
    }
    .last-expression-member-bracket {
      height: var(--height);
      display: grid;
      grid-template-columns: repeat(2, auto);
      .last-expression-member-bracket-middle {
        width: 5px;
        background-color: var(--background-color);
      }
      .last-expression-member-bracket-start {
        width: calc(var(--height) / 2);
        background-color: var(--background-color);
        -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAgTCA1MCwxMDAgNTAsMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
        mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAgTCA1MCwxMDAgNTAsMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
      }
    }
  }
  .head {
    display: grid;
    grid-template-columns: repeat(3, auto);
    height: var(--height);
    .head-start {
      display: grid;
      height: var(--height);
      grid-template-columns: repeat(2, auto);
      .head-start-middle {
        width: 5px;
        background-color: var(--background-color);
      }
      .head-start-end {
        width: calc(var(--height) / 2);
        background-color: var(--background-color);
        -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEwgNTAsMCBBIDUwLDUwIDAgMSAwIDUwLDEwMCBMIDAsMTAwIiBzdHlsZT0iZmlsbDogI2ZmZjsiIC8+Cjwvc3ZnPg==');
        mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEwgNTAsMCBBIDUwLDUwIDAgMSAwIDUwLDEwMCBMIDAsMTAwIiBzdHlsZT0iZmlsbDogI2ZmZjsiIC8+Cjwvc3ZnPg==');
      }
    }
    .head-inner {

    }
    .head-end {
      display: grid;
      height: var(--height);
      grid-template-columns: repeat(3, auto);
      .head-end-start {
        width: calc(var(--height) / 2);
        background-color: var(--background-color);
        -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAgTCA1MCwxMDAgNTAsMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
        mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAgTCA1MCwxMDAgNTAsMCIgc3R5bGU9ImZpbGw6ICNmZmY7IiAvPgo8L3N2Zz4=');
      }
      .head-end-middle {
        width: 5px;
        background-color: var(--background-color);
      }
      .head-end-end {
        width: calc(var(--height) / 2);
        background-color: var(--background-color);
        -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAiIHN0eWxlPSJmaWxsOiAjZmZmOyIgLz4KPC9zdmc+');
        mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCAxMDAiPgogIDxwYXRoIGQ9Ik0gMCwwIEEgNTAsNTAgMCAwIDEgMCwxMDAiIHN0eWxlPSJmaWxsOiAjZmZmOyIgLz4KPC9zdmc+');
      }
    }
  }
}
.identifier-chain.has-head {
  grid-template-columns: repeat(calc(var(--members-count) + 1), auto);
  > .member {
    > .member-chain-right {
      border-radius: 0;
      padding-right: calc(var(--height) / 4);
    }
    > .member-chain-left.member-chain-right {
      border-radius: calc(var(--height) / 2) 0 0 calc(var(--height) / 2);

    }
  }
}
.identifier-chain.active {
  --background-color: var(--color-active);
}
</style>