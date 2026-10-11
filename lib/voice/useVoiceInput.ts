"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { isWebSpeechSupported } from "./speech-recognition";
import { transcribeViaGateway } from "./transcribe-client";
import { useWebSpeechSession } from "./useWebSpeechSession";

export type VoiceInputPhase = "idle" | "listening" | "processing";

export type UseVoiceInputOptions = {
  onFinalTranscript: (text: string, source: "gateway" | "web-speech") => void;
  disabled?: boolean;
};

export function useVoiceInput(options: UseVoiceInputOptions) {
  const { onFinalTranscript, disabled = false } = options;
  const [phase, setPhase] = useState<VoiceInputPhase>("idle");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const webSpeech = useWebSpeechSession();
  const onFinalRef = useRef(onFinalTranscript);

  const bindHandlers = webSpeech.bindHandlers;
  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    bindHandlers({
      onInterim: setInterimText,
      onFinalChunk: () => setInterimText(""),
      onError: (code) => setError(`Web Speech: ${code}`),
    });
  }, [bindHandlers]);

  const stopTracks = useCallback((recorder: MediaRecorder | null) => {
    recorder?.stream.getTracks().forEach((track) => track.stop());
  }, []);

  const finishWithBlob = useCallback(
    async (blob: Blob) => {
      setPhase("processing");
      setUsedFallback(false);
      try {
        const result = await transcribeViaGateway(blob);
        onFinalRef.current(result.text, "gateway");
        setInterimText("");
        setError(null);
      } catch {
        const fallback = webSpeech.getAccumulatedFinal();
        if (fallback) {
          setUsedFallback(true);
          onFinalRef.current(fallback, "web-speech");
          setInterimText("");
          setError(null);
        } else if (isWebSpeechSupported()) {
          setError("Шлюз STT недоступен, речь не распознана.");
        } else {
          setError(
            "STT недоступен. Включите Web Speech (Chrome) или voice-gateway.",
          );
        }
      } finally {
        webSpeech.reset();
        setPhase("idle");
      }
    },
    [webSpeech],
  );

  const startListening = useCallback(async () => {
    if (disabled || phase !== "idle") return;
    setError(null);
    setInterimText("");
    setUsedFallback(false);
    webSpeech.reset();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        stopTracks(recorder);
        void finishWithBlob(blob);
      };
      recorderRef.current = recorder;
      recorder.start();
      webSpeech.start();
      setPhase("listening");
    } catch {
      setError("Нет доступа к микрофону.");
    }
  }, [disabled, finishWithBlob, phase, stopTracks, webSpeech]);

  const stopListening = useCallback(() => {
    if (phase !== "listening") return;
    webSpeech.stop();
    recorderRef.current?.stop();
    recorderRef.current = null;
  }, [phase, webSpeech]);

  return {
    phase,
    interimText,
    error,
    usedFallback,
    webSpeechAvailable: isWebSpeechSupported(),
    startListening,
    stopListening,
    isListening: phase === "listening",
    isProcessing: phase === "processing",
  };
}
