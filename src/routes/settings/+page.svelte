<script>
    import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";
    import UnitInput from "#/components/Inputs/UnitInput.svelte";
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
            <Label small>{$_("settings.autosaveEnabled")}
                <Tooltip>{$_("settings.autosaveComment")}</Tooltip>
            </Label>
            <TextSwitchButton wide onText="Y" offText="N" bind:checked={KPASettings.autosaveEnabled}></TextSwitchButton>
            <Label small>{$_("settings.autosaveInterval")}</Label>
            <UnitInput bind:value={KPASettings.autosaveInterval} step={1} unit="s" disabled={!KPASettings.autosaveEnabled}></UnitInput>
        </div>
        <Label>{$_("settings.hotkey")}</Label>
        <p>{$_("settings.joke")}</p>
        <div class="settings-column hotkeys">
            <span>Space:</span>
            <span>{$_("settings.hotkeys.playpause")}</span>
            <span>R:</span>
            <span>{$_("settings.hotkeys.placeNode")}</span>
            <span>Q/W/E/R:</span>
            <span>{$_("settings.hotkeys.placeNote")}</span>
            <span>Ctrl:</span>
            <span>{$_("settings.hotkeys.toLines")}</span>
            <span>{$_("general.wheel")}:</span>
            <span>{$_("settings.hotkeys.scrollTime")}</span>
            <span>Ctrl + {$_("general.wheel")}:</span>
            <span>{$_("settings.hotkeys.switchLine")}</span>
            <span>Ctrl + S:</span>
            <span>{$_("settings.hotkeys.save")}</span>
            <span>Tab:</span>
            <span>{$_("settings.hotkeys.switchSeq")}</span>
            <span>Shift + Tab:</span>
            <span>{$_("settings.hotkeys.switchSeqPrev")}</span>
        </div>
    </div>
</main>

<style lang="less" scoped>
    @import "#/components/mixin.less";
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
        width: 40vh;
        align-items: center;
        gap: 1vh;
    }
    input {
        width: 100%;
        .input();
        font-size: var(--font-size-medium);
    }

    p {
        font-size: var(--font-size-smaller);
        color: var(--color-foreground);
    }
    .hotkeys {
        gap: 2px;
        span {
            display: block;
            width: 100%;
            height: 100%;
            background-color: #5557;
            color: var(--color-foreground);
            border-radius: var(--border-radius);
            font-size: var(--font-size-small);
            padding: 0.2em 0.25em;
            box-sizing: border-box;
        }
    }

</style>