class MetricHistogramScheduler {
    histograms = []
    intervalIds = {}
    available = []

    start(histogram) {
        if (!histograms.any(h => h.collectionInterval === histogram.collectionInterval)) {
            intervalIds[histogram.collectionInterval] = setInterval(() => this.histograms.forEach(h => h.collect()), histogram.collectionInterval)
        }

        histograms.push(histogram)
    }

    startAll() {
        this.available.forEach(a => a.start())
    }

    stop(histogram) {
        let index = histograms.indexOf(histogram)

        if (index > -1) {
            histograms.splice(index, 1)
        }

        //if we don't have any more histograms that have the same interval, then clear the interval if it's in the intervalIds
        if (histograms.filter(h => h.collectionInterval == histogram.collectionInterval) == 0 && histograms.collectionInterval in intervalIds) {
            clearInterval(intervalIds[histogram.collectionInterval])
        }
    }

    stopAll() {
        this.available.forEach(a => a.stop())
    }
}

let scheduler = new MetricHistogramScheduler()
let noop = function() {}
class MetricHistogram {
    on = false
    collection = []

    constructor(name, collectionInterval, accessor, init = noop, teardown = noop) {
        this.name = name
        this.accessor = accessor
        this.collectionInterval = collectionInterval
        this.init = init
        this.teardown = teardown
    }

    collect() {
        this.collection.push({ timestamp: new Date().getTime(), value: this.accessor() })
    }

    start() {
        this.stop()
        this.init()
        scheduler.start(this)
    }

    stop() {
        this.teardown()
        scheduler.stop(this)
    }
}

import { today, goals } from "user-activity"
import { battery, charger } from "power";
import { HeartRateSensor } from "heart-rate";

const ONE_MINUTE = 60 * 1000
const FIVE_MINUTES = 5 * ONE_MINUTE
const TEN_MINUTES = 10 * ONE_MINUTE

let steps = new MetricHistogram('steps', ONE_MINUTE, () => todayActivity.local.steps || 0)
let elevation = new MetricHistogram('elevationGain', ONE_MINUTE, () => today.local.elevationGain || 0)
let heartRateMonitor = new HeartRateSensor()
let hr = new MetricHistogram('hr', ONE_MINUTE, () => heartRateMonitor.heartRate || '--', () => heartRateMonitor.start(), () => heartRateMonitor.stop()) //might have to reinit?
let power = new MetricHistogram('power', FIVE_MINUTES, () => battery.chargeLevel)
let incharger = new MetricHistogram('incharger', TEN_MINUTES, () => charger.connected)
let calories = new MetricHistogram('calories', FIVE_MINUTES, () => today.local.calories)

scheduler.available.concat([steps, elevation, heartRateMonitor, hr, power, incharger, calories])

export { scheduler, steps, elevation, heartRateMonitor, hr, power, incharger, calories }
