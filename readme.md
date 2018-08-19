Metric Collection / Half Assed Histograms for fitbit os
---

Metric collection on a schedule for use in fitbit apps. Historical data is not available using the fitbit api, so here's a half decent attempt.

```javascript
let steps = new MetricHistogram('steps', ONE_MINUTE, () => todayActivity.local.steps || 0)
let elevation = new MetricHistogram('elevationGain', ONE_MINUTE, () => today.local.elevationGain || 0)
let heartRateMonitor = new HeartRateSensor()
let hr = new MetricHistogram('hr', ONE_MINUTE, () => heartRateMonitor.heartRate || '--', () => heartRateMonitor.start(), () => heartRateMonitor.stop()) //might have to reinit?
let power = new MetricHistogram('power', FIVE_MINUTES, () => battery.chargeLevel)
let incharger = new MetricHistogram('incharger', TEN_MINUTES, () => charger.connected)
let calories = new MetricHistogram('calories', FIVE_MINUTES, () => today.local.calories)
```

The above histograms can be interacted with directly, using the `metric.start()` to start collecting metrics, accessable via `metric.collection`.

You can stop the collection of metrics using `metric.stop()`.

MetricHistograms are stored in the `scheduler.available` list. Append your own schedulers to this list in order for them to be started using `scheduler.startAll()` and `scheduler.stopAll()`.