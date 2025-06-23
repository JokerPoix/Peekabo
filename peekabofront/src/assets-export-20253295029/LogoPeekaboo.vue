<template>
  <svg
    :class="className"
    :width="width ? width : height ? false : 391"
    :height="height ? height : false"
    viewBox="0 0 391 65"
    :fill="color ? color : '#FFCC00'"
    :style="cssProps"
    :aria-hidden="title ? false : desc ? false : true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title v-if="!!title">{{ title }}</title>
    <desc v-if="!!desc">{{ desc }}</desc>
    <rect width="391" height="65" />
  </svg>
</template>

<script>
export default {
  props: {
    activeColor: {
      required: false,
      type: String
    },
    className: {
      required: false,
      type: String
    },
    color: {
      required: false,
      type: String
    },
    desc: {
      required: false,
      type: String
    },
    focusColor: {
      required: false,
      type: String
    },
    hoverColor: {
      required: false,
      type: String
    },
    width: {
      required: false,
      type: String
    },
    height: {
      required: false,
      type: String
    },
    title: {
      required: false,
      type: String
    },
  },
  computed: {
    cssProps() {
      return {
        '--active-color': this.activeColor || 'currentColor',
        '--focus-color': this.focusColor || 'currentColor',
        '--hover-color': this.hoverColor || 'currentColor'
      }
    }
  }
}
</script>

<style scoped>
svg:hover {
  fill: var(--hover-color)
}
svg:focus {
  fill: var(--focus-color)
}
svg:active {
  fill: var(--active-color)
}
</style>
