// eslint-disable-next-line import/no-nodejs-modules, unicorn/prefer-node-protocol
import assert from 'assert';
// import * as utils from './../utils';
// import { sleep } from '../utils';
import type { WasmMemParams, WasmMemRegionsData } from './wasmMemUtils';
import type { WasmModules } from './wasmLoader';
import { MemRegionsEnum, getMemRegionsSizesAndOffsets } from './wasmMemUtils';
import type { WasmRunParams } from './wasmRun';
import { WasmRun } from './wasmRun';
import type { WasmViews } from './wasmViews';
import { buildWasmMemViews } from './wasmViews';
import { mainConfig } from '../../config/mainConfig';
import { PAGE_SIZE_BYTES } from '../../common';

interface WasmEngineParams {
  numWorkers: number;
}

class WasmEngine {
  private params: WasmEngineParams;
  private wasmMem: WebAssembly.Memory;
  private wasmRegionsSizes: WasmMemRegionsData;
  private wasmRegionsOffsets: WasmMemRegionsData;
  private wasmViews: WasmViews;
  private wasmRunParams: WasmRunParams;
  private wasmRun: WasmRun;
  private wasmModules: WasmModules;

  public async init(params: WasmEngineParams): Promise<void> {
    this.params = params;
    await this.initWasm();
  }

  private async initWasm(): Promise<void> {
    this.initWasmMemRegions();
    this.allocWasmMem();
    this.wasmViews = buildWasmMemViews(
      this.wasmMem,
      this.wasmRegionsOffsets,
      this.wasmRegionsSizes,
    );
    await this.initWasmRun();
  }

  private allocWasmMem(): void {
    const startSize = this.wasmRegionsSizes[MemRegionsEnum.START_MEM];
    const startOffset = this.wasmRegionsOffsets[MemRegionsEnum.START_MEM];
    const wasmMemStartTotalSize = startOffset + startSize;
    const { wasmMemStartPages: initial, wasmMemMaxPages: maximum } = mainConfig;
    assert.ok(initial * PAGE_SIZE_BYTES >= wasmMemStartTotalSize);
    const memory = new WebAssembly.Memory({
      initial,
      maximum,
      shared: true,
    });
    this.wasmMem = memory;
    console.log(
      `wasm mem pages required: ${Math.ceil(
        wasmMemStartTotalSize / PAGE_SIZE_BYTES,
      )}`,
    );
    console.log(`wasm mem config start pages: ${initial}`);
  }

  private get NumTotalWorkers(): number {
    return 1 + this.params.numWorkers;
  }

  private initWasmMemRegions(): void {
    const numTotalWorkers = this.NumTotalWorkers;

    // set wasm mem regions sizes
    const wasmMemParams: WasmMemParams = {
      startOffset: mainConfig.wasmMemStartOffset,
      syncArraySize: numTotalWorkers * Int32Array.BYTES_PER_ELEMENT,
      sleepArraySize: numTotalWorkers * Int32Array.BYTES_PER_ELEMENT,
      numWorkers: numTotalWorkers,
      workerHeapSize: PAGE_SIZE_BYTES * mainConfig.wasmWorkerHeapPages,
      sharedHeapSize: mainConfig.wasmSharedHeapSize,
      // TODO use 64bit/8 byte counter for mem counters? see wasm workerHeapManager
      workersMemCountersSize: numTotalWorkers * Uint32Array.BYTES_PER_ELEMENT,
      hrTimerSize: BigUint64Array.BYTES_PER_ELEMENT,
    };

    const [sizes, offsets] = getMemRegionsSizesAndOffsets(wasmMemParams);
    this.wasmRegionsSizes = sizes;
    this.wasmRegionsOffsets = offsets;

    console.log(
      'wasm mem regions sizes:',
      JSON.stringify(this.wasmRegionsSizes),
    );
    console.log(
      'wasm mem regions offsets:',
      JSON.stringify(this.wasmRegionsOffsets),
    );
    console.log(
      `wasm mem start offset: ${
        this.wasmRegionsOffsets[MemRegionsEnum.START_MEM]
      }`,
    );
    console.log(
      `wasm mem start size: ${this.wasmRegionsSizes[MemRegionsEnum.START_MEM]}`,
    );
  }

  private async initWasmRun(): Promise<void> {
    this.wasmRun = new WasmRun();

    const MAIN_WORKER_IDX = 0;

    this.wasmRunParams = {
      wasmMem: this.wasmMem,
      wasmMemRegionsSizes: this.wasmRegionsSizes,
      wasmMemRegionsOffsets: this.wasmRegionsOffsets,
      wasmWorkerHeapSize: mainConfig.wasmWorkerHeapPages * PAGE_SIZE_BYTES,
      mainWorkerIdx: MAIN_WORKER_IDX,
      workerIdx: 0,
      numWorkers: this.NumTotalWorkers,
      // surface0sizes: [imageWidth, imageHeight],
      // main thread init these fields in wasm engine
    };

    await this.wasmRun.init(this.wasmRunParams, this.wasmViews);

    this.wasmModules = this.wasmRun.WasmModules;

    Atomics.store(this.wasmViews.sleepArr, 0, 0); // main worker idx 0
    Atomics.store(this.wasmViews.syncArr, 0, 0);
  }

  // public render() {
  //   this.syncWorkers();
  //   try {
  //     this.wasmModules.engine.render();
  //   } catch (ex) {
  //     console.error(ex);
  //     throw ex;
  //   }
  //   this.waitWorkers();
  //   // const views = this.wasmRun.WasmViews;
  //   // console.log(views.hrTimer[0]);
  // }

  public get WasmRun(): WasmRun {
    return this.wasmRun;
  }

  public get WasmMem(): WebAssembly.Memory {
    return this.wasmMem;
  }

  public get WasmRunParams(): WasmRunParams {
    return this.wasmRunParams;
  }

  public get WasmRegionsSizes(): WasmMemRegionsData {
    return this.wasmRegionsSizes;
  }

  public get WasmRegionsOffsets(): WasmMemRegionsData {
    return this.wasmRegionsOffsets;
  }

  public get WasmModules(): WasmModules {
    return this.wasmModules;
  }

  public get WasmViews(): WasmViews {
    return this.wasmViews;
  }
}

export type { WasmEngineParams };
export { WasmEngine };
