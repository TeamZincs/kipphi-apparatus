<script lang="ts">
  import { writeTextFile, writeFile, mkdir, exists } from "@tauri-apps/plugin-fs";
  import { join } from "@tauri-apps/api/path";
  import { goto } from "$app/navigation";
  import { getExtension } from "#/util"


  import { type PageData } from "./$types";
  import { _ } from "#/i18n";
  // import { _ } from "svelte-i18n";



  import { EasingType, EvaluatorType, EventNodeSequence, SCHEMA, VERSION, 
    type BPMSegmentData, type ChartDataKPA2, type EventLayerDataKPA2,
    type EventNodeSequenceDataKPA2, type EventType, type EventValueESType, type JudgeLineDataKPA2
  } from "kipphi";
  
  import { type ChartMetadata } from "#/queryCharts";

  const { data }: { data: PageData } = $props();
  const identifiers = new Set(data.chartInfos.map((info) => info.identifier));


  //#region 
  function getDuration(blob: Blob): Promise<number> {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    return new Promise((resolve) => {
      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration);
        URL.revokeObjectURL(url);
      }, {once: true});
    });
  }


  async function createChart(
    music: File,
    title: string,
    baseBPM: number,
  ): Promise<ChartDataKPA2> {
    const duration = await getDuration(music);
    if (!duration) {
      throw new Error("No duration found");
    }

    const eventNodeSequenceData: EventNodeSequenceDataKPA2<EventValueESType>[] = [];
    const orphanLines: JudgeLineDataKPA2[] = [];
    const bpmList: BPMSegmentData[] = [
      {
        bpm: baseBPM,
        startTime: [0, 0, 1], // 答案是0 0 0，因为鱼没有脑子
      },
    ];
    const judgeLineGroups: string[] = ["Default"];
    const addSequence = (
      id: string,
      type: Exclude<EventType, EventType.bpm | EventType.easing>,
    ) => {
      const defaultValue = EventNodeSequence.getDefaultValueFromEventType(type);
      const data: EventNodeSequenceDataKPA2<EventValueESType> = {
        id,
        type,
        events: [
          {
            startTime: [0, 0, 1],
            endTime: [1, 0, 1],
            start: defaultValue as EventValueESType,
            end: defaultValue as EventValueESType,
            evaluator: {
              type: EvaluatorType.eased,
              easing: {
                type: EasingType.normal,
                identifier: 1
              }
            }
          },
        ],
        endValue: defaultValue as EventValueESType
      };
      eventNodeSequenceData.push(data);
      return id;
    };
    const addJudgeLine = (i: number) => {
      const eventLayer: EventLayerDataKPA2 = {
        moveX: addSequence(`#${i}.0.moveX`, 0),
        moveY: addSequence(`#${i}.0.moveY`, 1),
        rotate: addSequence(`#${i}.0.rotate`, 2),
        alpha: addSequence(`#${i}.0.alpha`, 3)
      };
      const data: JudgeLineDataKPA2 = {
        id: i,
        group: 0,
        hnLists: {},
        nnLists: {},
        name: "untitled",
        texture: "line.png",
        eventLayers: [eventLayer],
        cover: true,
        speedEventNodeSeq: addSequence(`#${i}.speed`, 4),
        rotatesWithFather: false,
        anchor: [0.5, 0.5],
        zOrder: 0,
        children: [],
      };
      orphanLines.push(data);
    };
    for (let i = 0; i < 24; i++) {
      addJudgeLine(i);
    }
    return {
      version: VERSION,
      $schema: SCHEMA,
      offset: 0,
      duration: duration,
      info: {
        level: "0",
        name: title,
        charter: "",
        illustrator: "",
        composer: ""
      },
      ui: {},
      wrapperEasings: [],
      
      templateEasings: [],
      eventNodeSequences: eventNodeSequenceData,
      orphanLines,
      bpmList,
      judgeLineGroups,
    };
  }

  async function create() {
    if (idInput.value.trim() === "") {
      idState = EMPTY;
      return;
    }
    if (nameInput.value.trim() === "") {
      alert($_("create.alert.name"));
      return;
    }
    const bpm = bpmInput.valueAsNumber;
    if (isNaN(bpm) || bpm <= 0) {
      alert($_("create.alert.bpm"))
    }
    const music = musicFileInput.files?.[0];
    if (!music) {
      alert($_("form.alert.music"));
      return;
    }
    const illustration = illustrationFileInput.files?.[0];
    if (!illustration) {
      alert($_("form.alert.illustration"));
      return;
    }
    const chart = await createChart(music, nameInput.value, bpm);
    const chartData = JSON.stringify(chart, null, 2);
    const id = idInput.value.trim();
    const imageExt = getExtension(illustration);
    if (imageExt === null) {
      alert($_("form.alert.unknownImageType", {values:{filename: illustration.name}}));
      return;
    }
    const audioExt = getExtension(music);
    if (audioExt === null) {
      alert($_("form.alert.unknownAudioType", {values:{filename: music.name}}));
      return;
    }

    if (await exists(await join(data.meta.CHART_DIR, id))) {
      alert($_("form.alert.folderOccupied", {values:{folder: id}}));
    } else {
      await mkdir(await join(data.meta.CHART_DIR, id));
    }

    writeTextFile(await join(data.meta.CHART_DIR, id, "metadata.json"), JSON.stringify({
      "chart": "chart.kpa.json",
      "illustration": `illustration.${imageExt}`,
      "music": `music.${audioExt}`,
      "title": nameInput.value.trim(),
      "type": "KPA2",
      "durationSecs": chart.duration
    } satisfies ChartMetadata));
    writeTextFile(await join(data.meta.CHART_DIR, id, "chart.kpa.json"), chartData);
    writeFile(
      await join(data.meta.CHART_DIR, id, `illustration.${imageExt}`),
      new Uint8Array(await illustration.arrayBuffer())
    );
    writeFile(
      await join(data.meta.CHART_DIR, id, `music.${audioExt}`),
      new Uint8Array(await music.arrayBuffer())
    );

    success = true;
    setTimeout(() => {
      goto(`/charts/${id}`);
    }, 3000);

  }

  //#endregion
  let idInput: HTMLInputElement,
    nameInput: HTMLInputElement,
    bpmInput: HTMLInputElement,
    illustrationFileInput: HTMLInputElement,
    musicFileInput: HTMLInputElement;

  const getColor = (state: State) => {
    switch (state) {
      case AVAILABLE:
        return "green";
      case OCCUPIED:
      case EMPTY:
      case INVALID:
        return "red";
    }
  };
  const getContent = (state: State) => {
    switch (state) {
      case AVAILABLE:
        return $_("form.idState.available");
      case OCCUPIED:
        return $_("form.idState.occupied");
      case EMPTY:
        return $_("form.idState.empty");
      case INVALID:
        return $_("form.idState.invalid");
    }
  };

  const checkId = () => {
    if (idInput.value.trim() === "") {
      idState = EMPTY;
    } else if (identifiers.has(idInput.value)) {
      idState = OCCUPIED;
    } else if (idInput.value.match(/[^a-zA-Z0-9-_]/)) {
      idState = INVALID;
    } else {
      idState = AVAILABLE;
    }
  };

  
  const INITIAL = 0;
  const AVAILABLE = 1;
  const OCCUPIED = 2;
  const EMPTY = 3;
  const INVALID = 4;
  type State = 0 | 1 | 2 | 3 | 4;

  let success: boolean = $state(false);
  let idState: State = $state(INITIAL);
</script>

<main>
  <p>{$_("form.hint")}<br>
    {$_("form.chartsLocation", { values: { location: data.meta.CHART_DIR } })}
  </p>
  <div role="form">
    <label for="id">{$_("form.id")}</label>
    <input
      type="text"
      bind:this={idInput}
      placeholder="Identifier"
      oninput={checkId}
      onfocusout={checkId}
    />
    {#if idState !== INITIAL}
      <span
        style="color: {getColor(idState)};
      font-size: small;
      grid-column: 1 /span 2"
      >
        {getContent(idState)}
      </span>
    {/if}
    <label for="name">{$_("create.name")}</label>
    <input type="text" bind:this={nameInput} placeholder="Song Name" />
    <label for="bpm">{$_("create.bpm")}</label>
    <input type="number" bind:this={bpmInput} placeholder="BPM" />
    <label for="illustration">{$_("form.illustration")}</label>
    <input type="file" bind:this={illustrationFileInput} />
    <label for="music">{$_("form.music")}</label>
    <input type="file" bind:this={musicFileInput} />
    <input type="button" value={$_("create.create")} onclick={create} />
    {#if success}
      <p>{$_("create.success")}</p>
    {/if}
  </div>
</main>

<style>
  @import "#/formPage.css";
</style>
