<template>
  <div class="autocomplete-view" :class="{ 'dark-mode': isDarkMode }">
    <!-- <n-tabs v-model:value="valueType" type="segment">
      <n-tab-pane name="identifier" tab="Identifier">
        
        
      </n-tab-pane>
      <n-tab-pane name="value" tab="Value">
        <ValueView :expression="activeExpression" @update:expression="onUpdateExpression" />
      </n-tab-pane>
    </n-tabs> -->
    <n-tabs v-model:value="subView" type="segment">
      <n-tab name="functions" tab="Functions" />
      <n-tab name="elements" tab="Elements" />
      <n-tab name="variables" tab="Variables" />
      <n-tab name="static" tab="Static Value" />
    </n-tabs>
    <div class="pane" v-if="subView === 'functions' || subView === 'variables' || subView === 'elements'">
      <div class="identifier-view-wrapper" :class="{ 'show-smart-expression-widget': smartExpressionWidget, 'show-actions': selectedItem?.type === 'expression' }">
        <!-- <n-tabs :value="selctedItemPath[0]" @update:value="selctedItemPath = [$event]">
          <n-tab-pane v-for="{ name, children }, index in tabs" :key="name" :tab="name" :name="index">
            <div class="tab-inner">
              <AutocompleteTree :items="children" class="autocomplete-tree" />
            </div>
          </n-tab-pane>
        </n-tabs>
        <div v-if="smartExpressionWidget" class="smart-expression-widget">
          <component :is="smartExpressionWidget" :item="selectedItem" />
        </div>
        <div class="actions">
          <n-space justify="end">
            <n-button v-if="selectedItem?.type === 'expression'" type="default" round size="small" @click="handleUpdateClick">Update</n-button>
          </n-space>
        </div>
        <div v-if="slots.tutorial" class="tutorial-wrapper">
          <n-scrollbar>
            <slot name="tutorial" :selected-item="selectedItem" />
          </n-scrollbar>
        </div> -->
        <template v-for="{ name, children }, index in tabs" :key="name">
          <div v-if="selctedItemPath[0] === index" class="identifier-subgroup-view">
            <n-scrollbar>
              <AutocompleteTree :items="children" class="autocomplete-tree" />
            </n-scrollbar>
          </div>
        </template>
        <div v-if="smartExpressionWidget" class="smart-expression-widget">
          <component :is="smartExpressionWidget" :item="selectedItem" />
        </div>
        <div class="actions">
          <n-space justify="end">
            <n-button v-if="selectedItem?.type === 'expression'" type="default" round size="small" @click="handleUpdateClick">Update</n-button>
          </n-space>
        </div>
        <div v-if="slots.tutorial" class="tutorial-wrapper">
          <n-scrollbar>
            <slot name="tutorial" :selected-item="selectedItem" />
          </n-scrollbar>
        </div>
      </div>
    </div>
    <div v-else class="pane pane-static">
      <ValueView :expression="activeExpression" @update:expression="onUpdateExpression" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { provide, ref, watchEffect, computed, watch, toRef, inject, Ref, useSlots } from 'vue'
import { AutocompleteItem, AutocompleteItemWithPath, AutocompleteTab, useAutocompleteShortcuts, retrieveExpression, expressionIdentifierToAutocompleteIdentifier, getMemberNames, autocompleteIdentifierToExpressionIdentifier } from '../controllers/autocomplete'
import { NTabs, NTab, NTabPane, NButton, NSpace, NScrollbar } from 'naive-ui'
import AutocompleteTree from './AutocompleteTree.vue'
import _ from 'lodash'
import ValueView from './ValueView.vue'
import { Expression as CoreExpression } from '@bluepic/core'

import BBoxWidget, { isValid as isValidBBox } from './SmartExpressionWidgets/BBoxWidget.vue'

const props = defineProps<{
  model: AutocompleteTab[];
  selected: number[];
  activeExpression: CoreExpression.SimpleExpression | undefined;
  listenToKeyboard: boolean;
}>();
const emit = defineEmits(['update:selected', 'update:active-expression']);

const slots = useSlots();


const isDarkMode = inject('isDarkMode') as Ref<boolean>;

const valueType = ref<'identifier' | 'value'>('identifier');


const tabs = computed(() => {
  const loop = (item: AutocompleteItem, path: number[]): AutocompleteItemWithPath => {
    return {
      ...item,
      ...(() => {
        if (item.type !== 'divider' && item.children) {
          return {
            children: item.children.map((item, index) => loop(item, [...path, index])) as any
          }
        }
      })(),
      path
    }
  };
  return props.model.map((item, tabIndex) => {
    return {
      ...item,
      children: item.children.map((item, index) => loop(item, [tabIndex, index]))
    }
  });
});

const subView = ref<'elements' | 'variables' | 'functions' | 'static'>('functions');
watch(subView, () => {
  if (subView.value === 'functions') {
    selctedItemPath.value = [ 0 ]
  }
  else if (subView.value === 'elements') {
    selctedItemPath.value = [ 1 ]
  }
  else if (subView.value === 'variables') {
    selctedItemPath.value = [ 2 ]
  }
});


const allAutocompleteItems = computed(() => {
  const collectChilds = (item: AutocompleteItemWithPath): AutocompleteItemWithPath[] => {
    if (item.children) {
      return [
        ...item.children,
        ...([] as AutocompleteItemWithPath[]).concat(...item.children.map(collectChilds))
      ]
    }
    else {
      return [];
    }
  }
  return ([] as AutocompleteItemWithPath[]).concat(...tabs.value.map(tabItem => {
    return ([] as AutocompleteItemWithPath[]).concat(...tabItem.children.map(collectChilds))
  }))
});

const selctedItemPath = ref(props.selected);
provide('selctedItemPath', selctedItemPath);
watch(() => props.selected, (newSelectedPath) => {
  selctedItemPath.value = newSelectedPath;
});
watch(selctedItemPath, () => {
  if (!_.isEqual(props.selected, selctedItemPath.value)) {
    emit('update:selected', selctedItemPath.value);
  }
});

const selectedItem = computed(() => {
  return retrieveExpression(tabs.value[selctedItemPath.value[0]], selctedItemPath.value.slice(1))
});

const {} = useAutocompleteShortcuts(selctedItemPath, tabs, computed(() => props.listenToKeyboard));

const activeExpression = toRef(props, 'activeExpression');
const selectActiveExpressionWithinAutocompleteView = () => {
  
  if (activeExpression.value?.type === 'Identifier' || activeExpression.value?.type === 'Call') {
    valueType.value = 'identifier';
    const identifier = (activeExpression.value as CoreExpression.SimpleExpressionCallWithName | CoreExpression.SimpleExpressionIdentifier).identifier.filter(member => member !== undefined) as (CoreExpression.SimpleExpressionIdentifierExpression | CoreExpression.SimpleExpressionIdentifierStatic)[];
    try {
      const autocompleteIdentifier = expressionIdentifierToAutocompleteIdentifier(identifier);
      const autocompleteExpression = allAutocompleteItems.value.find(item => {
        if (item.type === 'expression') {
          return _.isEqual(item.identifier, autocompleteIdentifier);
        }
      });

      if (autocompleteExpression) {
        selctedItemPath.value = autocompleteExpression.path;
      }

    }
    catch {
      return undefined;
    }
    
    
    
  }
  else if (activeExpression.value?.type === 'Literal' || activeExpression.value?.type === 'Object') {
    valueType.value = 'value';
    
  }
  
}
watch(activeExpression, selectActiveExpressionWithinAutocompleteView);

provide('activeExpression', activeExpression);

const onUpdateExpression = (activeExpression: CoreExpression.SimpleExpression) => {
  emit('update:active-expression', activeExpression);
}

const replaceExpressionWithAutocompleteItem = (item: AutocompleteItemWithPath) => {
  if (item.type === 'expression') {
    const funcArgs = (() => {
      if (item.expressionType === 'function') {
        return item.argumentsResolver(activeExpression.value);
      }
      else {
        return [];
      }
    })();
    
    const identifier = autocompleteIdentifierToExpressionIdentifier(item.identifier, item.expressionType, funcArgs);
    if (identifier) {
      onUpdateExpression(identifier);
    }
  }
}
provide('replaceExpressionWithAutocompleteItem', replaceExpressionWithAutocompleteItem);

const handleUpdateClick = (event: MouseEvent) => {
  if (selectedItem.value?.type === 'expression') {
    replaceExpressionWithAutocompleteItem(selectedItem.value as AutocompleteItemWithPath);
  }
}


provide('onUpdateExpression', onUpdateExpression);


const smartExpressionWidget = computed(() => {
  if (selectedItem.value?.type === 'expression') {
    if (isValidBBox(selectedItem.value)) {
      return BBoxWidget;
    }
  }
  else {
    return undefined;
  }
});
</script>

<style scoped lang="scss">
.autocomplete-view {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .n-tabs {
    //overflow: hidden;
    // display: flex;
    // flex-direction: column;
    // width: 100%;
    .n-tab-pane {
      // overflow: hidden;
      // display: flex;
      // flex-direction: row;
      // > .value-view {
      //   flex: 1;
      // }

      // .identifier-view-wrapper {
      //   flex: 1;
      // }
      // .tutorial-wrapper {
      //   flex: none;
      // }
    }
  }
}
.pane {
  overflow: hidden;
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  // > .value-view {
  //   flex: 1;
  // }

  // .identifier-view-wrapper {
  //   flex: 1;
  // }
  // .tutorial-wrapper {
  //   flex: none;
  // }
}
.pane-static {
  display: block;
  width: 100%;
}
.autocomplete-view.dark-mode {
  border-top-color: rgb(255, 255, 255, 0.2);
}
.tab-inner {
  
}
.identifier-view-wrapper {
  // display: flex;
  // flex-direction: column;
  flex: 1;
  display: grid;
  grid-template-columns: 100%;
  grid-template-columns: auto max-content;
  grid-template-rows: auto 48px;
  gap: 0px;
  //row-gap: 10px;
  //border-top: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  > * {
    overflow: hidden;
  }
  .identifier-subgroup-view {
    grid-row: 1 / span 2;
    grid-column: 1 / span 1;
    --sub-menu-max-width: 300px;
    --active-color: rgb(50, 101, 212);
    --active-color-hover: rgba(0, 0, 0, 0.05);
    --active-text-color: #fff;
    --list-font-size: 0.9em;
    //border: 1px solid #333;
    .autocomplete-tree {
      height: auto;
    }
  }
  .tutorial-wrapper {
    grid-column: 2 / span 1;
    grid-row: 1 / span 1;
  }
  .actions {
    display: grid;
    place-items: center end;
    pointer-events: none;
    // grid-column: 1 / span 1;
    // grid-row: 2 / span 1;
    // padding-right: 50px;
    grid-row: 2 / span 1;
    grid-column: 2 / span 1;
    .n-button {
      pointer-events: all;
    }
  }
  // .n-tab-pane {
  //   display: flex;
  //   flex-direction: column;
  //   .tab-inner {
  //     overflow: scroll;
  //     white-space: nowrap;
  //   }
  //   .tab-inner::-webkit-scrollbar {
  //     display: none;
  //   }
  // }
  .smart-expression-widget {
    grid-column: 2 / span 1;
    grid-row: 1 / span 1;
  }
  .actions {
    padding: 0px;
    grid-row: 2 / span 1;
    grid-column: 1 / span 2;
    overflow: hidden;
  }
}
.identifier-view-wrapper.show-actions {
  .n-tab-pane {
    .tab-inner {
      padding-bottom: 30px;
    } 
  }
}
.identifier-view-wrapper.show-smart-expression-widget {
  grid-template-columns: auto max-content;
}

.smart-expression-widget {
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

</style>