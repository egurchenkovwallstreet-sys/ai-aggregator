"use client";

import { useCallback, useRef } from "react";

import {
  getSpeechRecognitionCtor,
  readTranscriptsFromEvent,
  type SpeechRecognitionLike,
} from "./speech-recognition";

export type WebSpeechHandlers = {
  onInterim: (text: string) => void;
  onFinalChunk: (text: string) => void;
  onError: (message: string) => void;
};

/** Сессия Web Speech для interim (4.5) и fallback final (4.3). */
export function useWebSpeechSession() {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalBufferRef = useRef("");
  const handlersRef = useRef<WebSpeechHandlers | null>(null);

  const bindHandlers = useCallback((handlers: WebSpeechHandlers) => {
    handlersRef.current = handlers;
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return false;

    finalBufferRef.current = "";
    const recognition = new Ctor();
    recognition.lang = "ru-RU";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const handlers = handlersRef.current;
      if (!handlers) return;
      const { interim, final } = readTranscriptsFromEvent(event);
      if (interim) handlers.onInterim(interim);
      if (final) {
        finalBufferRef.current = `${finalBufferRef.current} ${final}`.trim();
        handlers.onFinalChunk(final);
        handlers.onInterim("");
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      handlersRef.current?.onError(event.error);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    return true;
  }, []);

  const getAccumulatedFinal = useCallback(
    () => finalBufferRef.current.trim(),
    [],
  );

  const reset = useCallback(() => {
    finalBufferRef.current = "";
  }, []);

  return { bindHandlers, start, stop, getAccumulatedFinal, reset };
}
