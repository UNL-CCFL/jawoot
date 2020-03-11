<template>
  <div class="percentage_ring">
    <div class="percentage_ring__value">{{percentage}}%</div>

    <svg
        :height="radius * 2"
        :width="radius * 2"
        class="percentage_ring"
       >
        <defs>
          <linearGradient id="percentage_ring__gradient" gradientTransform="rotate(90)">
            <stop class="stop1" offset="0%"/>
            <stop class="stop2" offset="100%"/>
          </linearGradient>
        </defs>
        <circle
            :stroke-dasharray="circumference + ' ' + circumference"
            :style="{ strokeDashoffset: strokeDashoffset }"
            :stroke-width="stroke"
            fill="transparent"
            :r="normalizedRadius"
            :cx="radius"
            :cy="radius"
         />
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    radius: Number,
    percentage: Number,
    stroke: Number
  },
  data() {
    const normalizedRadius = this.radius - this.stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    return {
      normalizedRadius,
      circumference
    };
  },
  created() {
    console.log(this.percentage,'!!!');
  },
  computed: {
    strokeDashoffset() {
      return this.circumference - this.percentage / 100 * this.circumference;
    }
  },
}
</script>
