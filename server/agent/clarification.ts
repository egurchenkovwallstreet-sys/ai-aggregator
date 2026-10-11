import "server-only";

import type { AgentContentType } from "./dialog.schema";

export const CLARIFICATION_SLOTS = [
  "subject",
  "style",
  "angle",
  "color",
] as const;
export type ClarificationSlot = (typeof CLARIFICATION_SLOTS)[number];

export type ClarificationState = {
  filled: ClarificationSlot[];
  missing: ClarificationSlot[];
  nextQuestions: string[];
  ready: boolean;
};

type DialogLine = { role: "user" | "assistant"; content: string };

type SlotSpec = {
  id: ClarificationSlot;
  question: string;
  tokens: string[];
};

const MAX_QUESTIONS_PER_TURN = 2;
const MIN_OPTIONAL_FILLED = 2;
const MAX_USER_TURNS = 5;

const GREETING_ONLY =
  /^(привет(ик)?|здравствуй(те)?|добр(ый|ое|ая)\s+(день|утро|вечер|ночь)|хай|hello|hi|ку)[\s!.?]*$/iu;

const SKIP_REMAINING =
  /на тво[её] усмотрени|как считаешь|как хочешь|не важно|без разницы|любой вариант|сам реши|на твоё усмотр/iu;

const PROCEED_RE =
  /(^|[^\p{L}])(?:собери(?:те)?(?:\s+промпт)?|готово|хватит уточн\p{L}*|без уточнен\p{L}*|давай уже|погнали|можно собирать)(?=[^\p{L}]|$)/iu;

export function wantsToProceed(text: string): boolean {
  return PROCEED_RE.test(text);
}

/** Стем ≥4 букв допускает окончание; короткие — только явное совпадение. */
function stemPattern(token: string): string {
  if (/[\\(*?[|]/.test(token)) return token;
  if (token.length >= 4) return `${token}\\p{L}*`;
  return token;
}

function tokenRegex(tokens: string[]): RegExp {
  const body = tokens.map(stemPattern).join("|");
  return new RegExp(
    `(^|[^\\p{L}\\p{N}])(?:${body})(?=[^\\p{L}\\p{N}]|$)`,
    "iu",
  );
}

function slotsFor(contentType: AgentContentType): SlotSpec[] {
  return [
    {
      id: "subject",
      question: subjectQuestion(contentType),
      tokens: [],
    },
    {
      id: "style",
      question: styleQuestion(contentType),
      tokens: styleTokens(contentType),
    },
    {
      id: "angle",
      question: angleQuestion(contentType),
      tokens: angleTokens(contentType),
    },
    {
      id: "color",
      question: colorQuestion(contentType),
      tokens: colorTokens(),
    },
  ];
}

function subjectQuestion(type: AgentContentType): string {
  if (type === "image")
    return "Что должно быть в кадре — кто или что главный объект?";
  if (type === "video") return "Что происходит в ролике от начала до конца?";
  if (type === "audio") return "О чём трек или для чего он нужен?";
  return "О чём текст и какая у него цель?";
}

function styleQuestion(type: AgentContentType): string {
  if (type === "image") return "Какой стиль ближе — фото, иллюстрация или 3D?";
  if (type === "video") return "Какой стиль ролика — кино, реклама или клип?";
  if (type === "audio")
    return "Какой жанр — электроника, акустика или оркестр?";
  return "Какой тон текста — деловой, разговорный или художественный?";
}

function angleQuestion(type: AgentContentType): string {
  if (type === "image")
    return "Какой ракурс — крупный план, вид сбоку или сверху?";
  if (type === "video")
    return "Как работает камера — статично, наезд или облёт?";
  if (type === "audio")
    return "Как звучит пространство — крупный вокал, плотная группа или минимализм?";
  return "Какой формат — пост, письмо, статья или сценарий?";
}

function colorQuestion(type: AgentContentType): string {
  if (type === "audio")
    return "Какое настроение и окраска — тёплый лоу-фай, холодный синти или яркий поп?";
  if (type === "text")
    return "Какая окраска речи — сдержанная, живая или провокационная?";
  return "Какие цвет и свет — тёплый закат, холодный неон или спокойная пастель?";
}

function styleTokens(type: AgentContentType): string[] {
  if (type === "audio") {
    return [
      "электроник",
      "акустик",
      "оркестр",
      "джаз",
      "рок",
      "поп(?:сов\\p{L}*)?",
      "хип-?хоп",
      "ло[уф]-?фай",
      "lo-?fi",
      "эмбиент",
      "синти",
    ];
  }
  if (type === "text") {
    return [
      "делов",
      "официальн",
      "разговорн",
      "художественн",
      "дружелюбн",
      "строг",
      "юмор",
      "экспертн",
    ];
  }
  if (type === "video") {
    return [
      "кино",
      "фильм",
      "реклам",
      "клип",
      "документальн",
      "анимац",
      "тикток",
      "бло[гк]",
    ];
  }
  return [
    "фото",
    "реализм",
    "иллюстрац",
    "3d",
    "3д",
    "аниме",
    "пиксел",
    "акварел",
    "живопис",
    "комикс",
    "киберпанк",
    "ретро",
    "винтаж",
  ];
}

function angleTokens(type: AgentContentType): string[] {
  if (type === "text") {
    return [
      "пост",
      "письм",
      "статья",
      "статью",
      "сценари",
      "тред",
      "рассылк",
      "заголовок",
    ];
  }
  if (type === "audio") {
    return [
      "вокал",
      "инструментал",
      "минимал",
      "плотн",
      "группа",
      "хор",
      "соло",
    ];
  }
  return [
    "ракурс",
    "крупн\\p{L}*\\s+план\\p{L}*",
    "общий\\s+план\\p{L}*",
    "вид\\s+сверху",
    "вид\\s+снизу",
    "профиль",
    "анфас",
    "сбоку",
    "наезд",
    "обл[её]т",
    "статичн",
    "камер",
    "композиц",
  ];
}

function colorTokens(): string[] {
  return [
    "цвет",
    "палитр",
    "освещ",
    "свет(?:л\\p{L}*)?",
    "неон",
    "пастел",
    "монохром",
    "чёрно-бел",
    "черно-бел",
    "тёпл",
    "тепл",
    "холодн",
    "закат",
    "рассвет",
    "золот",
    "красн",
    "син(?:ий|яя|ее|ие|им|ей)",
    "голуб",
    "зелён",
    "зелен",
    "жёлт",
    "желт",
    "чёрн",
    "черн",
    "бел(?:ый|ая|ое|ые|ым|ой|ую)",
    "розов",
    "оранж",
    "контраст",
    "настроени",
  ];
}

function userMessages(messages: DialogLine[]): string[] {
  return messages
    .filter((line) => line.role === "user")
    .map((line) => line.content.trim())
    .filter(Boolean);
}

function hasSubject(texts: string[]): boolean {
  return texts.some((text) => {
    if (GREETING_ONLY.test(text) || SKIP_REMAINING.test(text)) return false;
    const words = text.split(/\s+/).filter(Boolean);
    return words.length >= 2 || text.length >= 12;
  });
}

function hasTokenMatch(text: string, tokens: string[]): boolean {
  if (tokens.length === 0) return false;
  return tokenRegex(tokens).test(text);
}

function isReady(
  filled: ClarificationSlot[],
  userTurns: number,
  lastUser: string,
): boolean {
  if (PROCEED_RE.test(lastUser)) return true;
  if (!filled.includes("subject")) return false;
  const optional = filled.filter((slot) => slot !== "subject").length;
  if (optional >= MIN_OPTIONAL_FILLED) return true;
  return userTurns >= MAX_USER_TURNS;
}

/** Разбор диалога: какие слоты SPEC (стиль / ракурс / цвет) уже закрыты. */
export function analyzeClarification(
  messages: DialogLine[],
  contentType: AgentContentType,
): ClarificationState {
  const texts = userMessages(messages);
  const lastUser = texts.at(-1) ?? "";
  const joined = texts.join("\n");
  const specs = slotsFor(contentType);
  const skipRest = SKIP_REMAINING.test(lastUser) && hasSubject(texts);

  const filled: ClarificationSlot[] = [];
  for (const spec of specs) {
    if (spec.id === "subject" && hasSubject(texts)) {
      filled.push("subject");
      continue;
    }
    if (
      spec.id !== "subject" &&
      (skipRest || hasTokenMatch(joined, spec.tokens))
    ) {
      filled.push(spec.id);
    }
  }

  const missing = CLARIFICATION_SLOTS.filter((slot) => !filled.includes(slot));
  const ready = isReady(filled, texts.length, lastUser);
  const nextQuestions = ready
    ? []
    : specs
        .filter((spec) => missing.includes(spec.id))
        .slice(0, MAX_QUESTIONS_PER_TURN)
        .map((spec) => spec.question);

  return { filled, missing, nextQuestions, ready };
}

export function buildClarificationBrief(state: ClarificationState): string {
  if (state.ready) {
    return [
      "## Состояние уточнений",
      "Деталей достаточно или пользователь просит собрать промпт.",
      "Новых уточняющих вопросов не задавай.",
      "Кратко перескажи понимание и спроси: «Собрать финальный промпт?»",
      "Маркеры финального промпта не выводи, пока нет явного согласия.",
    ].join("\n");
  }

  const filled = state.filled.length
    ? `Похоже, уже сказано: ${labelSlots(state.filled)}.`
    : "Пока почти ничего не уточнено.";
  const lines = [
    "## Состояние уточнений",
    filled,
    `Ещё не ясно: ${labelSlots(state.missing)}.`,
    `В этой реплике задай не больше ${MAX_QUESTIONS_PER_TURN} вопросов, по смыслу такие:`,
    ...state.nextQuestions.map(
      (question, index) => `${index + 1}. ${question}`,
    ),
    "Не переспрашивай то, что пользователь уже назвал. Если ответ расплывчатый — дай 2–3 варианта.",
  ];
  return lines.join("\n");
}

function labelSlots(slots: ClarificationSlot[]): string {
  const labels: Record<ClarificationSlot, string> = {
    subject: "сюжет",
    style: "стиль",
    angle: "ракурс",
    color: "цвет",
  };
  return slots.map((slot) => labels[slot]).join(", ");
}
