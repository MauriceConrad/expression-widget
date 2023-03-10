import { Component, h } from 'vue'
import { NIcon } from 'naive-ui'

export default function renderIcon(icon: Component) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    })
  }
}