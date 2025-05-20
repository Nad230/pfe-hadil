declare module 'react-use-record' {
    export interface AudioRecorderProps {
        startRecording: () => void;
        stopRecording: () => void;
        recordingBlob: Blob | null;
        isRecording: boolean;
    }

    export function AudioRecorder(): AudioRecorderProps;
}
