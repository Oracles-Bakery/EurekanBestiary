<script>
  import ZoneForecast from "./components/ZoneForecast.svelte";

  document.title = "Eureka Weather Forecast";
</script>

<h1 class="font-size-24 font-weight-bold">Forecast for Eureka</h1>

<div class="row">
  <div class="col-12 col-md-3">
    <ZoneForecast zone="anemos" />
  </div>
  <div class="col-12 col-md-3">
    <ZoneForecast zone="pagos" />
  </div>
  <div class="col-12 col-md-3">
    <ZoneForecast zone="pyros" />
  </div>
  <div class="col-12 col-md-3">
    <ZoneForecast zone="hydatos" />
  </div>
</div>
