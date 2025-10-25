<script lang="ts">
    import { _ } from "#/i18n";
</script>

<nav>
<a href="/" id="logo"><img src="/icon.svg" alt="Kipphi Apparatus"></a>
<header>KPA</header>
    <slot/>
</nav>

<style>
  nav {
    display: flex;
    flex-direction: row;
    background-color: #222;
    box-shadow: 2px 2px 2px rgba(20, 21, 22, 0.5);
    padding: 0.5em;
    gap: 0.4em;
    position: fixed;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    box-sizing: border-box;
  }
  #logo {
    align-items: center;
    display: flex;
  }
  nav img {
    height: 3em;
  }
  nav header {
    flex: 1;
    font-size: 180%;
    align-self: center;
    color: white;
  }
  
</style>