<script lang="ts">
    import { Languages } from "@lucide/svelte";

    import ProgressiveButton from "#/components/buttons/ProgressiveButton.svelte";
    import UploadButton from "#/components/buttons/UploadButton.svelte";
    import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";
    import UnitInput from "#/components/Inputs/UnitInput.svelte";
    import Label from "#/components/Label.svelte";
    import Navigator from "#/components/Navigator.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import Tooltip from "#/components/Tooltip.svelte";
    import { _, localeLangNames, locale } from "#/i18n";
    import { notify } from "#/notify.svelte";
    import {
        queryRespackList,
        uploadRespack,
        uploadTexture,
        type RespackEntry,
    } from "#/background";
    import { KPASettings } from "#/settings.svelte";
    import Respack from "./Respack.svelte";

    let respackList: RespackEntry[] = $state([]);
    let file: File = $state(null);
    respackList = await queryRespackList();
</script>

<main class="container">
    <Navigator><span class="return">{$_("general.pressIconToReturn")}</span></Navigator>
    <div class="content">
        <h1>{$_("chartIndex.nav.settings")}</h1>
        <div class="settings-columns">
            <div class="settings-column">
                <Label small><Languages/>{$_("settings.language")}</Label>
                <PopupOption
                    wide
                    options={Object.keys(localeLangNames)}
                    displayTexts={Object.values(localeLangNames)}
                    bind:currentOption={
                        () => KPASettings.lang,
                        (val) => {
                            KPASettings.lang = val;
                            locale.set(val);
                            console.log("Locale changed.", val);
                        }
                    }
                ></PopupOption>
                <Label small
                    >{$_("settings.useRpeEasingId")}
                    <Tooltip>{$_("settings.useRpeEasingIdWarning")}</Tooltip>
                </Label>
                <TextSwitchButton
                    wide
                    onText="Y"
                    offText="N"
                    bind:checked={KPASettings.useRpeEasingId}
                ></TextSwitchButton>
                <Label small
                    >{$_("settings.autosaveEnabled")}
                    <Tooltip>{$_("settings.autosaveComment")}</Tooltip>
                </Label>
                <TextSwitchButton
                    wide
                    onText="Y"
                    offText="N"
                    bind:checked={KPASettings.autosaveEnabled}
                ></TextSwitchButton>
                <Label small>{$_("settings.autosaveInterval")}</Label>
                <UnitInput
                    bind:value={KPASettings.autosaveInterval}
                    step={1}
                    unit="s"
                    disabled={!KPASettings.autosaveEnabled}
                ></UnitInput>
                <Label small>{$_("settings.playerWidth")}</Label>
                <UnitInput
                    bind:value={KPASettings.playerWidth}
                    step={1}
                    unit="px"
                ></UnitInput>
            </div>
            <div class="settings-column hotkeys">
                <div class="whole-row">
                    <Label>{$_("settings.hotkey")}</Label>
                    <p>{$_("settings.joke")}</p>
                </div>
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
            <div class="settings-column-flex respacks">
                <Label>{$_("settings.respack")}</Label>
                <Respack pathname={null} name={"KPA-Official"} shortPathname={"Default"}></Respack>
                {#each respackList as respackEntry}
                    <Respack
                        pathname={respackEntry.pathname}
                        name={respackEntry.name}
                        shortPathname={respackEntry.shortPathname}
                    />
                {/each}
                <div class="flex-row">
                    <UploadButton accept="application/zip" bind:file
                    ></UploadButton>
                    <ProgressiveButton
                        onclick={async () => {
                            if (
                                file.name === "Default" ||
                                respackList.find(
                                    (res) => res.pathname === file.name,
                                )
                            ) {
                                return notify(
                                    $_("settings.respackExists"),
                                    "error",
                                );
                            }
                            try {
                                await uploadRespack(file.name, file);
                                notify($_("settings.uploadSuccess"), "info");
                            } catch (e) {
                                return notify(e + "", "error");
                            }
                        }}>{$_("settings.upload")}</ProgressiveButton
                    >
                </div>
            </div>
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
            color: var(--color-foreground);
        }
        .return {
            color: var(--color-foreground);
        }
    }
    .content {
        padding: 10vh;
        box-sizing: border-box;
        height: 100vh;
        display: flex;
        flex-direction: column;
    }
    .settings-columns {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        width: 100%;
        height: 100%;
    }
    .settings-column {
        display: grid;
        grid-template-columns: auto 1fr;
        width: 40vh;
        align-items: center;
        gap: 1vh;
    }
    .whole-row {
        grid-column: 1 / 3;
    }
    .settings-column-flex {
        display: flex;
        flex-direction: column;
        gap: 1vh;
        align-items: center;
        width: 40vh;
    }
    .respacks {
        min-height: 20vh;
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
