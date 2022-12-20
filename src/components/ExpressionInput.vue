<template>
  <div class="expression-input" :class="{ 'dark-mode': isDarkMode }">
    <div class="main-input-wrapper">
      <div class="actions-wrapper">
        <!-- <n-switch :value="mode === 'ux'" @update:value="mode = $event ? 'ux' : 'text'" /> -->
        <n-tabs type="segment" :size="('tiny' as any)" v-model:value="mode">
          <n-tab name="text">
            <n-icon>
              <code-outline />
            </n-icon>
          </n-tab>
          <n-tab name="ux">
            <n-icon>
              <eye-outline />
            </n-icon>
          </n-tab>
        </n-tabs>
      </div>
      <div ref="inputWrapperRef" class="input-wrapper" :class="{ hidden: mode === 'ux' }" />
      <div v-if="mode === 'ux'" class="smart-wrapper">
        <ExpressionWidget v-if="expression" ref="expressionWidget" :model-value="expression" @update:model-value="syncCode" v-model:active-expression="activeExpression" />
      </div>
    </div>
    <div v-show="activeExpression" class="autocomplete-wrapper">
      <AutocompleteView :model="autocomplete" v-model:selected="selected" :active-expression="activeExpression" @update:active-expression="onUpdateActiveExpression" :listen-to-keyboard="listenToKeyboard" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CodeFlask from 'codeflask'
import { onMounted, watch, ref, computed, Ref, reactive, watchEffect, provide } from 'vue'
import { NSwitch, NTabs, NTab, NIcon, useThemeVars } from 'naive-ui'
import { EyeOutline, CodeOutline } from '@vicons/ionicons5'
import { ExpressionController, parseExpr, SimpleExpression, findClosestExpression, findExactMatchingExpression, SimpleExpressionCallWithName, SimpleExpressionIdentifier, SimpleExpressionIdentifierExpression, SimpleExpressionIdentifierStatic } from '../controllers/expression'
//import jsep from 'jsep'
import ExpressionWidget from './ExpressionWidget.vue'
import _ from 'lodash'
import { expressionIdentifierToAutocompleteIdentifier, AutocompleteTab } from '../controllers/autocomplete'
import AutocompleteView from './AutocompleteView.vue'
import color from 'color'
import { emit } from 'process'

const props = withDefaults(defineProps<{
  modelValue: string;
  autocomplete: AutocompleteTab[];
  max?: number;
  evalExpression?: (expr: string) => any;
  //darkMode?: boolean;
}>(), {
  max: Infinity,
  evalExpression: (expr: string) => {
    return 42;
  }
});

const emit = defineEmits(['update:model-value']);

const theme = useThemeVars();


const isDarkMode = computed(() => {
  const colorVal = (color(theme.value.baseColor).rgb() as any).color as number[];
  const middleVal = colorVal.reduce((acc, val) => val * acc, 1);
  return middleVal < 256 ** 3;
});
provide('isDarkMode', isDarkMode);

const inputWrapperRef = ref<HTMLDivElement>();
const flask = ref<CodeFlask>();

const expression = ref<SimpleExpression>();
const activeExpression = ref<SimpleExpression>();

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

const syncExpression = () => {  
  if (syncUX.value) {
    const newExpr = parseExpr(code.value);
    if (!_.isEqual(newExpr, expression.value)) {
      expression.value = newExpr;
    }
  }
}
watch(code, syncExpression);


const syncCode = (newExpr: SimpleExpression) => {
  if (syncText.value && flask.value) {
    const newCode = ExpressionController.toString(newExpr);
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

const listenToKeyboard = ref(true);


onMounted(() => {
  if (inputWrapperRef.value) {
    flask.value = new CodeFlask(inputWrapperRef.value, {
      language: 'js',
      defaultTheme: true
    });
    const textarea = inputWrapperRef.value?.querySelector('.codeflask__textarea') as HTMLTextAreaElement | null;
    flask.value.onUpdate(currCode => {
      flask.value?.updateCode(currCode.replaceAll(/\n/g, ' '));
      const finalCurrCode = flask.value?.getCode();
      if (finalCurrCode && finalCurrCode !== code.value) {
        code.value = finalCurrCode;
      }
      //expression.value = parseExpr(code);
    });
    
    if (textarea) {
      textarea.addEventListener('focus', () => {
        listenToKeyboard.value = false;
      });
      textarea.addEventListener('blur', () => {
        listenToKeyboard.value = true;
      });
      textarea.addEventListener('click', (event) => {
        if (event.altKey && expression.value) {
          const closestExpression = findClosestExpression(expression.value, textarea.selectionStart, textarea.selectionEnd);
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
        if (expression.value) {
          const closestExpression = findExactMatchingExpression(expression.value, textarea.selectionStart, textarea.selectionEnd);
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


const onUpdateActiveExpression = (newActiveExpression: SimpleExpression) => {
  if (activeExpression.value) {
    if (mode.value == 'ux') {
      if (expressionWidget.value && expressionWidget.value.expressionController) {
        expressionWidget.value.expressionController.replace(activeExpression.value, newActiveExpression); 
      }
    }
    else if (flask.value && activeExpression.value.type !== 'Unparsed' && activeExpression.value.range) {
      const code = flask.value.getCode();
      flask.value.updateCode(`${ code.slice(0, activeExpression.value.range[0]) }${ ExpressionController.toString(newActiveExpression) }${ code.slice(activeExpression.value.range[1]) }`)
    }
  }
}

provide('evalExpression', (expr: SimpleExpression) => {
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

</script>


<style scoped lang="scss">
.expression-input {
  --main-width: 600px;
  width: var(--main-width);
  height: auto;
  padding: 10px;
  --smart-expression-height: 26px;
  --smart-expression-text-offset-y: 1px;
  --seperator-offset-y: 5px;
  --font-size: 14px;
  --smart-expression-font-size: 11px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .autocomplete-wrapper {
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    .autocomplete-view {
      
      // box-sizing: border-box;
    }
  }
  .main-input-wrapper {
    display: grid;
    grid-template-rows: max-content max-content;
    grid-template-columns: 100%;
    .actions-wrapper {
      grid-row: 1 / span 1;
      grid-column: 1 / span 1;
      display: grid;
      grid-template-columns: auto 50px;
      .n-tabs {
        grid-column: 2 / span 1;
      }
      padding-bottom: 5px;
    }
    .input-wrapper, .smart-wrapper {
      grid-row: 2 / span 1;
      grid-column: 1 / span 1;
      margin-bottom: 4px;
      overflow: scroll;
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    .input-wrapper::-webkit-scrollbar, .smart-wrapper::-webkit-scrollbar {
      display: none;
    }
    .smart-wrapper {
      display: flex;
      align-items: center;
    }
    .input-wrapper {
      --width: var(--main-width);
      ::v-deep(.codeflask) {
        width: var(--width) !important;
      }
    }
    .input-wrapper.hidden {
      visibility: hidden;
    }
  }
}
.input-wrapper {
  --width: 100%;
  //--height: 200px;
  // --font-size: 32px;
  --line-height: 1.1;
  --padding-x: 10px;
  --padding-y: 10px;
  --height: calc(var(--font-size) * var(--line-height) + var(--padding-y) * 2);
  // width: var(--width);
  height: var(--height);
  font-family: monospace;
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