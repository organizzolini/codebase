import * as z from 'zod'
import { SearchMatchSource } from './operations'
import type { AuthorLookupInput, LinesRangeInput, TextLookupInput, SearchEnglishQuery, SearchLatinQuery } from './operations'

type Properties<T> = {
  [K in keyof T]: z.ZodType<T[K], T[K] | undefined>;
};

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export const SearchMatchSourceSchema: z.ZodType<SearchMatchSource, SearchMatchSource> = z.enum(SearchMatchSource);

export function AuthorLookupInputSchema(): z.ZodObject<Properties<AuthorLookupInput>> {
  return z.object({
    id: z.string().nullish(),
    slug: z.string().nullish()
  })
}

export function LinesRangeInputSchema(): z.ZodObject<Properties<LinesRangeInput>> {
  return z.object({
    endIndex: z.number().nullish(),
    startIndex: z.number().nullish()
  })
}

export function TextLookupInputSchema(): z.ZodObject<Properties<TextLookupInput>> {
  return z.object({
    id: z.string().nullish(),
    slug: z.string().nullish()
  })
}

export function SearchEnglishQuerySchema(): z.ZodType<SearchEnglishQuery> {
  return z.object({
    searchEnglish: z.object({
    edges: z.array(z.object({
    node: z.object({
    enclitic: z.string().nullable(),
    identifiers: z.array(z.string()),
    score: z.number(),
    source: SearchMatchSourceSchema,
    lexeme: z.object({
    id: z.string(),
    etymology: z.string().nullable(),
    lemma: z.string(),
    partOfSpeech: z.string(),
    inflection: z.union([
    z.object({
    declension: z.string(),
    degree: z.string()
}),
    z.object({
    adverbType: z.string(),
    degree: z.string()
}),
    z.object({
    declension: z.string(),
    gender: z.string()
}),
    z.object({
    case: z.string()
}),
    z.object({

}),
    z.object({
    conjugation: z.string(),
    other: z.string().nullable()
})
]).nullable(),
    principalParts: z.object({
    edges: z.array(z.object({
    node: z.object({
    text: z.array(z.string())
})
}))
}),
    pronunciations: z.object({
    edges: z.array(z.object({
    node: z.object({
    phonetic: z.string().nullable(),
    variant: z.string()
})
}))
}).nullable(),
    translations: z.object({
    edges: z.array(z.object({
    node: z.object({
    data: z.string()
})
}))
}).nullable(),
    wordForms: z.object({
    edges: z.array(z.object({
    node: z.object({
    id: z.string(),
    word: z.string(),
    form: z.union([
    z.object({
    __typename: z.literal('AdjectivalForm'),
    case: z.string(),
    gender: z.string(),
    number: z.string()
}),
    z.object({
    __typename: z.literal('AdverbForm'),
    degree: z.string()
}),
    z.object({
    __typename: z.literal('FiniteVerbForm'),
    mood: z.string(),
    number: z.string(),
    person: z.string(),
    tense: z.string(),
    voice: z.string()
}),
    z.object({
    __typename: z.literal('GerundForm'),
    case: z.string()
}),
    z.object({
    __typename: z.literal('InfinitiveForm'),
    tense: z.string(),
    voice: z.string()
}),
    z.object({
    __typename: z.literal('NominalForm'),
    case: z.string(),
    number: z.string()
}),
    z.object({
    __typename: z.literal('ParticipleForm'),
    tense: z.string(),
    voice: z.string()
}),
    z.object({
    __typename: z.literal('SupineForm'),
    case: z.string()
})
])
})
}))
})
})
})
}))
})
})
}

export function SearchLatinQuerySchema(): z.ZodType<SearchLatinQuery> {
  return z.object({
    searchLatin: z.object({
    edges: z.array(z.object({
    node: z.object({
    enclitic: z.string().nullable(),
    identifiers: z.array(z.string()),
    score: z.number(),
    source: SearchMatchSourceSchema,
    lexeme: z.object({
    id: z.string(),
    etymology: z.string().nullable(),
    lemma: z.string(),
    partOfSpeech: z.string(),
    inflection: z.union([
    z.object({
    declension: z.string(),
    degree: z.string()
}),
    z.object({
    adverbType: z.string(),
    degree: z.string()
}),
    z.object({
    declension: z.string(),
    gender: z.string()
}),
    z.object({
    case: z.string()
}),
    z.object({

}),
    z.object({
    conjugation: z.string(),
    other: z.string().nullable()
})
]).nullable(),
    principalParts: z.object({
    edges: z.array(z.object({
    node: z.object({
    text: z.array(z.string())
})
}))
}),
    pronunciations: z.object({
    edges: z.array(z.object({
    node: z.object({
    phonetic: z.string().nullable(),
    variant: z.string()
})
}))
}).nullable(),
    translations: z.object({
    edges: z.array(z.object({
    node: z.object({
    data: z.string()
})
}))
}).nullable(),
    wordForms: z.object({
    edges: z.array(z.object({
    node: z.object({
    id: z.string(),
    word: z.string(),
    form: z.union([
    z.object({
    __typename: z.literal('AdjectivalForm'),
    case: z.string(),
    gender: z.string(),
    number: z.string()
}),
    z.object({
    __typename: z.literal('AdverbForm'),
    degree: z.string()
}),
    z.object({
    __typename: z.literal('FiniteVerbForm'),
    mood: z.string(),
    number: z.string(),
    person: z.string(),
    tense: z.string(),
    voice: z.string()
}),
    z.object({
    __typename: z.literal('GerundForm'),
    case: z.string()
}),
    z.object({
    __typename: z.literal('InfinitiveForm'),
    tense: z.string(),
    voice: z.string()
}),
    z.object({
    __typename: z.literal('NominalForm'),
    case: z.string(),
    number: z.string()
}),
    z.object({
    __typename: z.literal('ParticipleForm'),
    tense: z.string(),
    voice: z.string()
}),
    z.object({
    __typename: z.literal('SupineForm'),
    case: z.string()
})
])
})
}))
})
})
})
}))
})
})
}
