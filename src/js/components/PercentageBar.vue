<template>
  <div id="percentage_wrapper" :class="{big : big}">
    <div id="percentage">{{percentageCrawl}}<slot name="percentage_append">%</slot></div>
    <div id="percentage_bar_overlay" :style="'width: '+(100-percentageWidth)+'%;'"></div>
    <div id="percentage_bar" :style="'width: '+(percentageWidth)+'%;'"></div>
  </div>
</template>

<script>
export default {
  props: {
    percentage: Number,
    big: {
      type: Boolean,
      default: false,
    },
    delayCount: {
      type: Number,
      default: 1,
    }
  },
  data() {
    return {
      percentageCrawl: 0.0,
      percentageWidth: 0.0,
      //we want the fill to take a second, so calculate how much to increment by
      fillIncrement: 1000 / this.percentage,
    };
  },
  created() {
    let self = this;
    setTimeout(function() {
      self.percentageWidth = self.percentage;
      const interval = setInterval(() => {
        self.percentageCrawl = Math.round((self.percentageCrawl + self.fillIncrement + Math.random()) * 10) / 10;
        if (self.percentageCrawl >= self.percentage) {
          self.percentageCrawl = self.percentage;
          clearInterval(interval);
        }
      }, 1000 / 10);
    },100 * this.delayCount);
  },
}
</script>
