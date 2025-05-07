declare module 'mic-recorder-to-mp3' {
    class MicRecorder {
      getMp3: any;
      constructor(config: { bitRate: number });
      start(): Promise<void>;
      stop(): Promise<{ getMp3: () => Promise<[Buffer, Blob]> }>;
    }
  
    export = MicRecorder;
  }