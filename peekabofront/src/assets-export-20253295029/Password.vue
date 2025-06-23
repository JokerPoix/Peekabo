<template>
  <svg
    :class="className"
    :width="width ? width : height ? false : 308"
    :height="height ? height : false"
    viewBox="0 0 308 61"
    :fill="color ? color : '#D9D9D9'"
    :style="cssProps"
    :aria-hidden="title ? false : desc ? false : true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title v-if="!!title">{{ title }}</title>
    <desc v-if="!!desc">{{ desc }}</desc>
    <g filter="url(#filter0_d_56_12)"><rect x="4" width="300" height="53" rx="20" /></g><defs><filter id="filter0_d_56_12" x="0" y="0" width="308" height="61" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_56_12"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_56_12" result="shape"/></filter></defs>
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
