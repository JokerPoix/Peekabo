<template>
  <svg
    :class="className"
    :width="width ? width : height ? false : 361"
    :height="height ? height : false"
    viewBox="0 0 361 318"
    :fill="color ? color : '#D9D9D9'"
    :style="cssProps"
    :aria-hidden="title ? false : desc ? false : true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title v-if="!!title">{{ title }}</title>
    <desc v-if="!!desc">{{ desc }}</desc>
    <g opacity="0.6" filter="url(#filter0_d_56_7)"><path d="M4 20C4 8.9543 12.9543 0 24 0H337C348.046 0 357 8.9543 357 20V290C357 301.046 348.046 310 337 310H24C12.9543 310 4 301.046 4 290V20Z" /></g><defs><filter id="filter0_d_56_7" x="0" y="0" width="361" height="318" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_56_7"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_56_7" result="shape"/></filter></defs>
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
