<script>
    import '#/app.css';
    import { locale } from "#/i18n";
    // import "#/shadcn.css"
</script>
{#if $locale}
<slot />
{/if}
