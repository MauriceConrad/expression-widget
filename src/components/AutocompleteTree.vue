<template>
  <div class="autocomplete-tree">
    <div class="items-list">
      <ul>
        <template v-for="item, index in items" :key="index">
          <!-- <template v-if="item.type === 'group' && !item.nested">
            <li class="flattened-group">
              <header>
                <span class="group-name">{{ item.label }}</span>
              </header>
              <main>
                <AutocompleteTree :items="item.children" />
              </main>
            </li>
          </template> -->
          <li v-if="item.type === 'divider'" class="group-divider">
            <span class="group-label">{{ item.label }}</span>
          </li>
          <!-- <li v-else :class="{ active: selectedItemIndex === index, 'global-active': globalSelectedItem == selectedItem }" @click="select(item, index)"></li> -->
          <template v-else>
            <li :class="{ active: itemWhichIsSubPathOfSelectedPath === item, 'global-active': selctedItemPath.length === item.path.length && itemWhichIsSubPathOfSelectedPath === item }" @click="select(item)">
              <div class="item-inner">
                <div class="area-left">
                  
                </div>
                <div class="label" @dblclick="handleDblclick($event, item)">
                  {{ item.label }}
                </div>
                <div class="area-right">
                  <n-icon v-if="item.children && item.children.length > 0">
                    <chevron-forward-outline />
                  </n-icon>
                </div>
              </div>
            </li>
            <div v-if="index < items.length - 1" class="divider" />
          </template>
        </template>
      </ul>
    </div>
    <AutocompleteTree v-if="itemWhichIsSubPathOfSelectedPath?.type !== 'divider' && itemWhichIsSubPathOfSelectedPath?.children && itemWhichIsSubPathOfSelectedPath?.children.length > 0" :items="itemWhichIsSubPathOfSelectedPath?.children" class="autocomplete-tree" />
  </div>
</template>


<script setup lang="ts">
import { ChevronForwardOutline } from '@vicons/ionicons5';
import { computed, inject, Ref, watch, ref, watchEffect } from 'vue'
import { AutocompleteItemWithPath, autocompleteIdentifierToExpressionIdentifier } from '../controllers/autocomplete'
import { NIcon } from 'naive-ui'
import { Expression as CoreExpression } from '@bluepic/core'

const props = defineProps<{
  items: AutocompleteItemWithPath[];
}>();

const selctedItemPath = inject('selctedItemPath') as Ref<number[]>;

const select = (item: AutocompleteItemWithPath) => {
  selctedItemPath.value = item.path;
}

const pathIsSubset = (path: number[], superPath: number[]) => {
  for (let index = 0; index < path.length; index++) {
    const pathIndex = path[index];
    const superPathIndex = superPath[index];
    if (pathIndex !== superPathIndex) {
      return false;
    }
  }
  return true;
}

const itemWhichIsSubPathOfSelectedPath = computed(() => {
  return props.items.find(item => {
    return pathIsSubset(item.path, selctedItemPath.value);
  });
});

const activeExpression = inject('activeExpression') as Ref<CoreExpression.SimpleExpression | undefined>;
const replaceExpressionWithAutocompleteItem = inject('replaceExpressionWithAutocompleteItem') as (item: AutocompleteItemWithPath) => void;

const onUpdateExpression = inject('onUpdateExpression') as (expr: CoreExpression.SimpleExpression) => void;
const handleDblclick = (event: MouseEvent, item: AutocompleteItemWithPath) => {
  replaceExpressionWithAutocompleteItem(item);
  event.preventDefault();

}

// const selectedItem = ref<AutocompleteItem>();
// watchEffect(() => {
//   console.log('SELCTED ITEM', selectedItem.value, props.items, selectedItem.value ? props.items.includes(selectedItem.value) : null);
  
// });
// const selectedItemIndex = ref(-1);
// //const selectedItemIndex = computed(() => selectedItem.value ? props.items.indexOf(selectedItem.value) : -1);
// //const selectedItem = computed(() => props.items[selectedItemIndex.value]);
// const select = (item: AutocompleteItem, index: number) => {
//   if (item.type !== 'divider' && item.children) {
//     selectedItem.value = item;
//     selectedItemIndex.value = index;
//   }
// }

// const selectedPath = computed(() => {
//   if (selectedItem.value?.type === 'expression') {
//     return selectedItem.value.identifier;
//   }
// });

// watch(selectedItem, () => {
//   //console.log('SELECTED ITEM UPDATE', selectedItem.value);
//   globalSelectedItem.value = selectedItem.value;
// });

</script>

<style scoped lang="scss">
.autocomplete-tree {
  display: inline-block;
  vertical-align: top;
  grid-template-columns: auto auto;
  //overflow: hidden;
  .items-list {
    display: inline-block;
    vertical-align: top;
    min-width: 100px;
    max-width: var(--sub-menu-max-width);
    > ul {
      list-style: none;
      margin: 0;
      padding: 0 0px;
      font-size: var(--list-font-size);
      color: var(--text-color); 
      > li {
        padding: 2px 4px;
        .item-inner {
          border: 2px solid transparent;
          box-sizing: border-box;
          cursor: pointer;
          border-radius: 5px;
          padding: 0px 5px;
          margin: 0;
          display: grid;
          grid-template-columns: max-content auto max-content;
          .area-right {
            display: grid;
            place-items: center;
          }
        }

      }
      > li + li {
        margin-top: 3px;
      }
      > li.active {
        .item-inner {
          border: 2px solid var(--active-color);
        }
      }
      > li.active.global-active {
        
        .item-inner {
          border: 2px solid transparent;
          background-color: var(--active-color);
          color: var(--active-text-color);
        }
        
      }
      > li:not(.active) {
        .item-inner:hover {
          background-color: var(--active-color-hover);
        }
      }
      > li.group-divider {
        padding: 0;
        padding: 0px 5px;
        .group-label {
          opacity: 0.8;
          font-size: 0.9em;
        }
      }
      // > li.flattened-group {
      //   display: grid;
      //   grid-template-columns: 100%;
      //   > header {
      //     .group-name {
      //       opacity: 0.8;
      //       font-size: 0.9em;
      //     }
      //   }
      //   > main {

      //   }
      // }
      .divider {
        //border-top: 1px solid rgba(0, 0, 0, 0.1);
        margin: 0px 0;
      }
    }
  }
  .autocomplete-tree {
    height: 100%;
    //border-left: 1px solid rgba(0, 0, 0, 0.1);
  }
}
</style>