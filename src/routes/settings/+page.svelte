<script>
    import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";
    import Label from "#/components/Label.svelte";
    import Navigator from "#/components/Navigator.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import Tooltip from "#/components/Tooltip.svelte";
    import { _, localeLangNames, locale } from "#/i18n";
    import { KPASettings } from "#/settings.svelte";

</script>
<main class="container">
    <Navigator></Navigator>
    <div class="content">
        <h1>{$_("chartIndex.nav.settings")}</h1>
        <div class="settings-column">
            <Label small>{$_("settings.language")}</Label>
            <PopupOption wide
                options={Object.keys(localeLangNames)}
                displayTexts={Object.values(localeLangNames)}
                bind:currentOption={
                    () => KPASettings.lang,
                    (val) => {
                        KPASettings.lang = val;
                        locale.set(val);
                        console.log("Locale changed.", val)
                    }
                }
            ></PopupOption>
            <Label small>{$_("settings.useRpeEasingId")}
                <Tooltip>{$_("settings.useRpeEasingIdWarning")}</Tooltip>
            </Label>
            <TextSwitchButton wide onText="Y" offText="N" bind:checked={KPASettings.useRpeEasingId}></TextSwitchButton>
        </div>
    </div>
</main>

<style lang="less" scoped>

    :root {
        --color-foreground: white;
    }
    .container {
        background-color: #777;
        height: 100%;
        h1 {
            color: var(--color-foreground)
        }
    }
    .content {
        padding: 10vh;
    }
    .settings-column {
        display: grid;
        grid-template-columns: auto 1fr;
        width: 30vh;
        align-items: center;
        gap: 1vh;
    }
</style>