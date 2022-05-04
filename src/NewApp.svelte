<script>
  import { Route, active } from "tinro";
  import halfmoon from "halfmoon";
  import Entry from "./Entry.svelte";
  import { time, weather } from "./stores.js";
  import Tracker from "./Tracker.svelte";
  import Forecast from "./Forecast.svelte";
  import OvniTimer from "./OvniTimer.svelte";
  import ZoneWeather from "./components/ZoneWeather.svelte";
  import day from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import Icon from "./components/Icon.svelte";
  import { formatUtc } from "./util";

  day.extend(relativeTime);

  const VERSION = "2.6.0";
  const isRedirected = window.location.hash === "#redirect";
  $: ezTime = formatUtc($time);
</script>

<div class="page-wrapper with-navbar">
  <nav class="navbar">
    <a href="/" class="navbar-brand">
      <img src="/logoicon.png" alt="logo icon" />
      Eurekan Bestiary
    </a>
    <div class="navbar-content">
      <strong
        class="px-10 py-5 d-none d-md-inline rounded bg-primary text-white"
      >
        {ezTime} ET
      </strong>
      <a href="/" use:active exact class="nav-item text-decoration-none">
        <a href="/" class="nav-link">Bestiary</a>
      </a>
      <a href="/forecast" use:active class="nav-item text-decoration-none">
        <a href="/forecast" class="nav-link">Forecast</a>
      </a>
      <a href="/ovnitimer" use:active class="nav-item text-decoration-none">
        <a href="/ovnitimer" class="nav-link">Ovni Timer</a>
      </a>
    </div>
    <div class="navbar-content ml-auto">
      <div class="d-none d-lg-block">
        <ZoneWeather zone="anemos" />
        <ZoneWeather zone="pagos" extraClasses="ml-5" />
        <ZoneWeather zone="pyros" extraClasses="ml-5" />
        <ZoneWeather zone="hydatos" extraClasses="ml-5" />
      </div>
      <div class="btn ml-5" on:click={() => halfmoon.toggleDarkMode()}>
        <Icon name="moon" extraClasses="inline-block" />
      </div>
    </div>
  </nav>
  <div class="content-wrapper">
    {#if isRedirected}
      <div class="container mt-15">
        <div class="alert alert-danger">
          <h4 class="alert-heading">Notice</h4>
          The website URL has changed to
          <a
            href="https://eureka.fernehalwes.org"
            class="alert-link font-weight-bold">eureka.fernehalwes.org</a
          >! Please update your bookmarks.
        </div>
      </div>
    {/if}
    <div class="container">
      <Route path="/">
        <Tracker />
      </Route>
      <Route path="/forecast">
        <Forecast />
      </Route>
      <Route path="/:zone/:slug" let:meta>
        <Entry {meta} />
      </Route>
      <Route path="/ovnitimer" let:meta>
        <OvniTimer {meta} />
      </Route>
      <Route path="/ovnitimer/:id" let:meta>
        <OvniTimer {meta} />
      </Route>
    </div>
    <footer class="my-15">
      <div class="container text-muted">
        <div class="mt-2">
          Created by Raiah Belse (Zodiark).<br />
          <a
            href="https://src.orran.net/eurekan-bestiary"
            class="underline text-blue-600"
          >
            Website Source
          </a>
          &bull; Version {VERSION}
        </div>
      </div>
    </footer>
  </div>
</div>
