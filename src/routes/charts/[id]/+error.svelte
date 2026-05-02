<script>
    import { _ } from "#/i18n";
    import { page } from "$app/state"; 

</script>
<span style="font-size: large;">{$_("error.chart")}</span>
<div>
    <div style="white-space: pre-wrap; padding:4px">
        {page.error?.stack ?? page.error}
    </div>
</div>
<a href="/">{$_("general.return")}</a>