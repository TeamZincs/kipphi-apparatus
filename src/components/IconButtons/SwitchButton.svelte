<script lang="ts">
    let {
        primary = false,
        wide = false,
        content,
        "class": className = "",
        checked = $bindable(false),
        onchange: onChange
    }: {
        primary?: boolean;
        wide?: boolean;
        content: (on: boolean) => any;
        "class"?: string;
        checked?: boolean;
        onchange?: (checked: boolean) => void;
    } = $props();
</script>
<!-- svelte-ignore a11y_interactive_supports_focus,a11y_click_events_have_key_events -->
<div
    class="icon-button {checked ? 'checked' : ''} {className}"
    class:wide
    class:primary
    role="button"
    onclick={() => {
        checked = !checked;
        if (onChange) {
            onChange(checked);
        }
    }}
>   
    {@render content(checked)}
</div>

<style>
.icon-button {
    border-radius: 8px;
    width: 8vh;
    height: 8vh;

    position: relative;
}
.wide {
   width: auto;
   padding-left: 1em;
   padding-right: 1em;
   height: 4.5vh;
   border-radius: var(--border-radius);
}

.icon-button:hover {
    background-color: #2222;
}

.icon-button.primary {
    background-color: white;
    color: black;
}
.icon-button.primary:hover {
    background-color: #eee;
}



</style>