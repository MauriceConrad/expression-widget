<template>
  <div class="expression-input" :class="{ 'dark-mode': isDarkMode }" :style="{ '--fixed-width': `${ width }px`, '--font-size': `${ fontSize }px`, '--smart-expression-font-size': `${ smartFontSize }px`, '--smart-expression-height': `${ smartHeight }px`, '--smart-expression-text-offset-y': `${ smartTextOffset }px`, '--seperator-offset-y': `${ seperatorOffset }px` }">
    <div class="main-input-wrapper">
      <div class="actions-wrapper">
        <!-- <n-switch :value="mode === 'ux'" @update:value="mode = $event ? 'ux' : 'text'" /> -->
        <!-- <n-tooltip v-if="error" placement="bottom-end">
          <template #trigger>
            <div class="error-tooltip">
              <n-icon>
                <alert-circle-outline />
              </n-icon>
            </div>
          </template>
          ({{ error.index }}) {{  error.description  }}
        </n-tooltip> -->
        <n-button circle tertiary :size="('tiny' as any)" @click="emit('close')">
          <template #icon>
            <n-icon>
              <close-outline />
            </n-icon>
          </template>
        </n-button>
        <n-tag v-if="error" type="error" size="small" class="error-tooltip">
          [{{ error.index }}] {{ error.description  }}
        </n-tag>
        <n-tabs type="segment" :size="('tiny' as any)" v-model:value="mode" class="n-dialog-no-drag">
          <n-tab name="text">
            <n-icon>
              <code-outline />
            </n-icon>
          </n-tab>
          <n-tab name="ux" :disabled="!!error">
            <n-icon>
              <eye-outline />
            </n-icon>
          </n-tab>
        </n-tabs>
      </div>
      <div ref="inputWrapperRef" class="input-wrapper n-dialog-no-drag" :class="{ hidden: mode === 'ux' }" />
      <div v-if="mode === 'ux'" class="smart-wrapper n-dialog-no-drag">
        <ExpressionWidget v-if="expression" ref="expressionWidget" :model-value="expression" @update:model-value="syncCode" v-model:active-expression="activeExpression" :editable-handle="editableHandle" />
      </div>
    </div>
    <!-- <span style="color: #fff;">{{ activeExpression ?? 'NULL' }}</span> -->
    <div v-show="activeExpression" class="autocomplete-wrapper n-dialog-no-drag">
      <AutocompleteView :model="autocomplete" v-model:selected="selected" :active-expression="realActiveExpression" @update:active-expression="onUpdateActiveExpression" :listen-to-keyboard="listenToKeyboard">
        <template v-if="slots.tutorial" #tutorial="{ selectedItem }">
          <slot name="tutorial" :selected-item="selectedItem" />
        </template>
      </AutocompleteView>
    </div>
    <div v-if="!activeExpression" class="no-active-expression-wrapper">
      <n-empty description="No expression identifier selected">
        <template #icon>
          <n-icon>
            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
              <path d="M70.9,39.7c3.1,0,9.1-2.5,9.1-10.6c0-8.1-5.8-8.5-7.6-8.5c-3.6,0-7.1,2.6-10.2,7.9C59.1,34,55.6,40,55.6,40 l-0.1,0c-0.8-3.8-1.4-7-1.7-8.4C53.2,28.3,49.3,21,41.3,21c-8,0-15.3,4.6-15.3,4.6l0,0c-1.4,0.9-2.3,2.4-2.3,4.1 c0,2.7,2.2,4.9,4.9,4.9c0.8,0,1.5-0.2,2.1-0.5l0,0c0,0,6.1-3.4,7.4,0c0.4,1,0.7,2.2,1.1,3.4c1.6,5.2,3,11.4,4.2,17l-5.2,7.6 c0,0-5.9-2.1-9-2.1S20,62.5,20,70.6s5.8,8.5,7.6,8.5c3.6,0,7.1-2.6,10.2-7.9c3.1-5.5,6.6-11.5,6.6-11.5c1,5,1.9,9,2.4,10.6 c2,5.7,6.6,9.1,12.7,9.1c0,0,6.3,0,13.7-4.2c1.8-0.7,3.1-2.5,3.1-4.5c0-2.7-2.2-4.9-4.9-4.9c-0.8,0-1.5,0.2-2.1,0.5l0,0 c0,0-5.3,3-7.1,0.6c-1.3-2.5-2.4-5.7-3.2-9.7c-0.8-3.6-1.7-7.8-2.5-11.9l5.3-7.7C61.9,37.6,67.8,39.7,70.9,39.7z" />
            </svg>
          </n-icon>
        </template>
      </n-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import CodeFlask from 'codeflask'
import { onMounted, watch, ref, computed, Ref, reactive, watchEffect, provide, useSlots } from 'vue'
import { NSwitch, NTabs, NTab, NIcon, useThemeVars, NTooltip, NEmpty, NTag, NButton } from 'naive-ui'
import { EyeOutline, CodeOutline, CloseOutline } from '@vicons/ionicons5'
//import { ExpressionController, parseExpr, SimpleExpression, findClosestExpression, findExactMatchingExpression, SimpleExpressionCallWithName, SimpleExpressionIdentifier, SimpleExpressionIdentifierExpression, SimpleExpressionIdentifierStatic } from '../controllers/expression'
//import jsep from 'jsep'
import ExpressionWidget from './ExpressionWidget.vue'
import _ from 'lodash'
import { expressionIdentifierToAutocompleteIdentifier, AutocompleteTab } from '../controllers/autocomplete'
import AutocompleteView from './AutocompleteView.vue'
import color from 'color'
import { Expression as CoreExpression } from '@bluepic/core'

const props = withDefaults(defineProps<{
  modelValue: string;
  autocomplete: AutocompleteTab[];
  max?: number;
  width?: number;
  fontSize: number;
  smartFontSize: number;
  smartHeight: number;
  smartTextOffset: number;
  seperatorOffset: number;
  editableHandle: (expr: CoreExpression.SimpleExpression, path: number[] | undefined) => boolean;
  evalExpression?: (expr: string) => any;
  //darkMode?: boolean;
}>(), {
  max: Infinity,
  evalExpression: (expr: string) => {
    return 42;
  },
  editableHandle: () => true
});

const emit = defineEmits(['update:model-value', 'update:error', 'close']);

const slots = useSlots();

const theme = useThemeVars();


const isDarkMode = computed(() => {
  const colorVal = (color(theme.value.baseColor).rgb() as any).color as number[];
  const middleVal = colorVal.reduce((acc, val) => val * acc, 1);
  return middleVal < 256 ** 3;
});
provide('isDarkMode', isDarkMode);

const inputWrapperRef = ref<HTMLDivElement>();
const flask = ref<CodeFlask>();

const expression = ref<CoreExpression.SimpleExpression>();
const activeExpression = ref<CoreExpression.SimpleExpression>();
const activeExpressionPath = ref<number[]>();
watch(activeExpression, (newActiveExpr) => {
  if (newActiveExpr && expression.value) {
    const validPath = CoreExpression.ExpressionController.getExpressionPath(newActiveExpr, expression.value);
    if (validPath) {
      activeExpressionPath.value = validPath;
    }
  }
});
const realActiveExpression = computed(() => {
  if (activeExpressionPath.value && expression.value) {
    return CoreExpression.ExpressionController.retrieveExpressionByPath(activeExpressionPath.value, expression.value);
  }
});

const expressionWidget = ref<InstanceType<typeof ExpressionWidget>>();

const code = ref<string>(props.modelValue);
// code.value = '$textarea1.lines[$i.sd.sdsd.sdsd.sdsdsdsd.s * sdsdsdsdsdsd(200, 300) + 2].width + 200';
// code.value = '300 + foo(42 * 55, 84)';
// code.value = "ADD(foo[ADD(bar, ADD(2, 3))], false, 42, $textarea1.lines[0].width, $textarea1.lines[$i].width, 'lolololol', {was:42})";
// //code.value = '$textarea1[$foo]';


const mode = ref<'text' | 'ux'>('ux');
const syncText = computed(() => {
  return mode.value === 'ux';
});
const syncUX = computed(() => {
  return true;
});

const error = ref<{
  index: number;
  description: string;
}>();
watchEffect(() => {
  emit('update:error', error.value);
});


const syncExpression = () => {  
  if (syncUX.value) {
    try {
      const newExpr = CoreExpression.parseExpr(code.value);
      error.value = undefined;
      if (!_.isEqual(newExpr, expression.value)) {
        expression.value = newExpr;
      }
    }
    catch (err) {
      console.error(err);
      
      error.value = {
        index: (err as any).index,
        description: (err as any).description
      }
      
    }
  }
}
watch(code, syncExpression);


const syncCode = (newExpr: CoreExpression.SimpleExpression) => {
  if (syncText.value && flask.value) {
    const newCode = CoreExpression.ExpressionController.toString(newExpr);
    if (code.value !== newCode) {
      code.value = newCode;
      flask.value.updateCode(code.value);
    }
  }
}

const selection = reactive({
  start: 0,
  end: 0,
  direction: 'forward'
});

const rawIsFocus = ref(false);
const listenToKeyboard = computed(() => !rawIsFocus.value);

onMounted(() => {
  if (inputWrapperRef.value) {
    flask.value = new CodeFlask(inputWrapperRef.value, {
      language: 'js',
      defaultTheme: false
    });
    const textarea = inputWrapperRef.value?.querySelector('.codeflask__textarea') as HTMLTextAreaElement | null;
    flask.value.onUpdate(currCode => {


      const safeCode = currCode.replaceAll(/\n/g, ' ');
      if (safeCode !== currCode) {
        flask.value?.updateCode(safeCode);
        return;
      }

      // flask.value?.updateCode(currCode.replaceAll(/\n/g, ' '));
      
      // const finalCurrCode = flask.value?.getCode();
      // if (finalCurrCode !== currCode) {
      //   return;
      // }
      if (currCode !== code.value) {
        code.value = currCode;
      }
      //expression.value = parseExpr(code);
    });
    
    if (textarea) {
      textarea.addEventListener('focus', () => {
        rawIsFocus.value = true;
      });
      textarea.addEventListener('blur', () => {
        rawIsFocus.value = false;
      });
      textarea.addEventListener('click', (event) => {
        if (event.altKey && expression.value) {
          const closestExpression = CoreExpression.findClosestExpression(expression.value, textarea.selectionStart, textarea.selectionEnd);
          if (closestExpression?.type !== 'Unparsed' && closestExpression?.range) {
            textarea.setSelectionRange(closestExpression?.range[0], closestExpression?.range[1], 'forward');
          }
        }
        
      });
      
      const checkSelectionRange = () => {
        if (selection.direction !== textarea?.selectionDirection) {
          selection.direction = textarea.selectionDirection;
        }
        if (selection.start !== textarea?.selectionStart) {
          selection.start = textarea.selectionStart;
        }
        if (selection.end !== textarea?.selectionEnd) {
          selection.end = textarea.selectionEnd;
        }
        window.requestAnimationFrame(checkSelectionRange);
      }
      checkSelectionRange();
      const updateActiveElementFromSelection = () => {
        if (mode.value === 'text' && rawIsFocus.value && expression.value) {
          const closestExpression = CoreExpression.findExactMatchingExpression(expression.value, textarea.selectionStart, textarea.selectionEnd);
          if (closestExpression) {
            activeExpression.value = closestExpression;
          }
          else {
            activeExpression.value = undefined;
          }
        }
        
      }
      watch(() => _.cloneDeep(selection), updateActiveElementFromSelection);
      textarea.addEventListener('dblclick', () => {
        // const code = flask.value?.getCode();
        // if (!code) {
        //   return;
        // }
        // expression.value = parseExpr(code);
      });
    }


    flask.value.updateCode(code.value);
    syncExpression();
  }
});


const selected = ref<number[]>([0]);


const onUpdateActiveExpression = (newActiveExpression: CoreExpression.SimpleExpression) => {
  
  if (activeExpression.value) {
    if (mode.value == 'ux') {

      if (expressionWidget.value && expressionWidget.value.expressionController) {
        expressionWidget.value.expressionController.replace(activeExpression.value, newActiveExpression); 
      }
    }
    else if (flask.value && activeExpression.value.type !== 'Unparsed' && activeExpression.value.range) {
      const code = flask.value.getCode();
      if (realActiveExpression.value) {
        
        if (realActiveExpression && realActiveExpression.value.type !== 'Unparsed' && realActiveExpression.value.range) {
          flask.value.updateCode(`${ code.slice(0, realActiveExpression.value.range[0]) }${ CoreExpression.ExpressionController.toString(newActiveExpression) }${ code.slice(realActiveExpression.value.range[1]) }`);
        }
      }
      
      //console.log('!!!', ExpressionController.toString(newActiveExpression));
      
      
    }
  }
}

provide('evalExpression', (expr: CoreExpression.SimpleExpression) => {
  if (expr.type !== 'Unparsed' && expr.range) {
    return props.evalExpression(code.value.slice(expr.range[0], expr.range[1]));
  }
  else {
    return undefined;
  }
});

watch(code, (newCode) => {
  emit('update:model-value', newCode);
});


defineExpose({
  error
});
</script>


<style scoped lang="scss">
.expression-input {
  // --main-width: var(var(--fixed-width), 250px);
  // width: var(--main-width);
  width: auto;
  height: auto;
  padding: 0px;
  // max-height: 400px;
  //--smart-expression-height: 26px;
  //--smart-expression-text-offset-y: 1px;
  //--seperator-offset-y: 5px;
  //--font-size: 18px;
  //--smart-expression-font-size: 11px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .autocomplete-wrapper {
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;

    .autocomplete-view {
      
      // box-sizing: border-box;
    }
  }
  .no-active-expression-wrapper {
    display: grid;
    place-items: center;
    height: 120px;
  }
  .main-input-wrapper {
    display: grid;
    grid-template-rows: max-content max-content;
    grid-template-columns: 100%;
    .actions-wrapper {
      grid-row: 1 / span 1;
      grid-column: 1 / span 1;
      display: grid;
      gap: 5px;
      grid-template-columns: auto max-content 50px;
      .error-tooltip {
        grid-column: 2 / span 1;
        display: grid;
        place-items: center;
        height: 20px;
        .n-icon {
          font-size: 18px;
          color: rgb(237, 67, 67);
        }
      }
      .n-tabs {
        grid-column: 3 / span 1;
        ::v-deep(.n-tabs-tab[data-disabled='true']) {
          .n-tabs-tab__label {
            opacity: 0.5;
          }
        }
      }
      padding-bottom: 5px;
    }
    .input-wrapper, .smart-wrapper {
      grid-row: 2 / span 1;
      grid-column: 1 / span 1;
      margin-bottom: 4px;
      overflow: scroll;
      white-space: nowrap;
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    .input-wrapper::-webkit-scrollbar, .smart-wrapper::-webkit-scrollbar {
      display: none;
    }
    .smart-wrapper {
      display: flex;
      align-items: center;
      padding-left: 1px;
      padding-bottom: 5px !important;
    }
    .input-wrapper {
      //--width: var(--main-width);
      ::v-deep(.codeflask) {
        //width: var(--width) !important;
      }
    }
    .input-wrapper.hidden {
      visibility: hidden;
    }
  }
  ::v-deep(.n-card) {
    background-color: rgba(0, 0, 0, 0.1) !important;
  }
}
.input-wrapper {
  //--width: 100%;
  //--height: 200px;
  // --font-size: 32px;
  --line-height: 1.1;
  --padding-x: 0px;
  --padding-y: 10px;
  --height: calc(var(--font-size) * var(--line-height) + var(--padding-y) * 2);
  // width: var(--width);
  height: var(--height);
  font-family: monospace;
  display: flex;

  ::v-deep(.codeflask) {
    background-color: transparent;
    // width: var(--width) !important;
    height: var(--height) !important;
    .codeflask__textarea {
      font-size: var(--font-size) !important;
      line-height: calc(var(--font-size) * var(--line-height));
      padding: var(--padding-y) var(--padding-x) !important;
      // ::selection {
      //   color: #f00 !important;
      //   background-color: #00f !important;
      // }
    }
    .codeflask__pre {
      font-size: var(--font-size) !important;
      line-height: calc(var(--font-size) * var(--line-height));
      padding: var(--padding-y) var(--padding-x) !important;
      color: rgb(97, 97, 97) !important;
      .token.punctuation {
        color: rgb(107, 107, 107) !important;
      }
      .token.constant {
        color: rgb(66, 114, 211) !important;
      }
      .token.number {
        color: rgb(241, 145, 41) !important;
      }
      .token.function {
        color: rgb(184, 41, 241) !important;
      }
      .token.string {
        color: rgb(26, 145, 66) !important;
      }
      .token.boolean {
        color: rgb(146, 0, 146) !important;
      }
    }
  }
}
.dark-mode {
  .input-wrapper {
    ::v-deep(.codeflask) {
      .codeflask__textarea {
        color: rgba(255, 255, 255, 0) !important;
        caret-color: #fff;
      }
      .codeflask__pre {
        color: rgb(255, 255, 255) !important;
        .token.punctuation {
          color: rgb(255, 255, 255) !important;
        }
        .token.string {
          color: rgb(40, 171, 83) !important;
        }
        .token.function {
          color: rgb(190, 75, 235) !important;
        }
      }
    }
  }
}
</style>
