import { GoogleGenAI, Type } from '@google/genai'
import { MUSCLE_GROUPS, DEFAULT_SETS, DEFAULT_REPS } from './constants'

export interface ParsedSet {
  reps: number
  weightKg: number | null
}

export interface ParsedExercise {
  name: string
  muscleGroup: string
  sets: ParsedSet[]
}

export interface ParsedWorkout {
  exercises: ParsedExercise[]
}

interface RawParsedSet {
  reps?: number
  weightKg?: number | null
}

interface RawParsedExercise {
  name?: string
  muscleGroup?: string
  sets?: RawParsedSet[]
}

interface RawParsedWorkout {
  exercises?: RawParsedExercise[]
}

let client: GoogleGenAI | null = null
function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }
  return client
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          muscleGroup: { type: Type.STRING, enum: [...MUSCLE_GROUPS] },
          sets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                reps: { type: Type.INTEGER },
                weightKg: { type: Type.NUMBER, nullable: true },
              },
              required: ['reps', 'weightKg'],
            },
          },
        },
        required: ['name', 'muscleGroup', 'sets'],
      },
    },
  },
  required: ['exercises'],
}

const PROMPT_PREFIX = "Extract structured workout data from this free-text log. " +
  "For each distinct exercise mentioned, output its name, its primary muscle " +
  "group (choose exactly one from the allowed enum), and its sets. If the user " +
  "gives an explicit sets x reps x weight (e.g. '4 sets of 8 at 60kg'), use " +
  "those exact numbers per set. If sets/reps are not specified at all for an " +
  "exercise (e.g. 'some squats'), output an empty sets array for that exercise " +
  "- the caller will fill in a sensible default. Never invent specific numbers " +
  "that were not stated or clearly implied. Weight is in kg; if the user gives " +
  "lb, convert to kg. If no weight is mentioned (bodyweight, or omitted), use " +
  "null.\n\nWorkout log:\n"

export async function parseWorkoutLog(text: string): Promise<ParsedWorkout> {
  const res = await getClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: PROMPT_PREFIX + text,
    config: { responseMimeType: 'application/json', responseSchema },
  })

  const raw = res.text
  if (!raw) throw new Error('Gemini returned an empty response')

  let parsed: RawParsedWorkout
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Gemini returned malformed JSON')
  }

  if (!parsed?.exercises || !Array.isArray(parsed.exercises) || parsed.exercises.length === 0) {
    throw new Error('No exercises could be extracted from that description')
  }

  return {
    exercises: parsed.exercises.map((ex): ParsedExercise => ({
      name: ex.name?.trim() || 'Unknown exercise',
      muscleGroup: (MUSCLE_GROUPS as readonly string[]).includes(ex.muscleGroup ?? '')
        ? (ex.muscleGroup as string)
        : 'other',
      sets: ex.sets && ex.sets.length > 0
        ? ex.sets.map((s) => ({ reps: s.reps ?? DEFAULT_REPS, weightKg: s.weightKg ?? null }))
        : Array.from({ length: DEFAULT_SETS }, () => ({ reps: DEFAULT_REPS, weightKg: null })),
    })),
  }
}
