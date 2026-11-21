import { Injectable } from "@nestjs/common";

import {
  InjectRepository,
  type Repository,
  Token,
  type Word,
  WordForm,
  WordLexeme,
} from "@codebase/lexico-db";

/**
 * Service resolving the readings of a clicked token through its stored link to its word.
 */
@Injectable()
export class WordCandidatesService {
  // 🏗 Dependency Injection

  public constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(WordForm)
    private readonly wordFormRepository: Repository<WordForm>,
    @InjectRepository(WordLexeme)
    private readonly wordLexemeRepository: Repository<WordLexeme>,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Finds the word a token is linked to; none for a missing, punctuation, or unlinked token. */
  private async findWordForToken(tokenId: string): Promise<null | Word> {
    const token = await this.tokenRepository.findOne({
      relations: { word: true },
      where: { id: tokenId },
    });
    return !token || token.isPunctuation ? null : (token.word ?? null);
  }

  // 🌎 Public Methods

  /**
   * Returns the word-form links of a token's word, each with its form's lexeme
   * and that lexeme's translations. Links come in the order they were stored,
   * and each lexeme's translations likewise, so the first translation is the
   * earliest recorded. A missing token, a punctuation token, and a
   * token with no word all return none.
   */
  public async findWordFormsForToken(tokenId: string): Promise<WordForm[]> {
    const word = await this.findWordForToken(tokenId);
    if (!word) return [];

    return this.wordFormRepository.find({
      order: { form: { lexeme: { translations: { id: "ASC" } } }, id: "ASC" },
      relations: { form: { lexeme: { translations: true } } },
      where: { word: { id: word.id } },
    });
  }

  /**
   * Returns the lexemes a token's word is the headword of, each with its
   * translations in the order they were stored. Words such as prepositions
   * and conjunctions have no forms, so this is the only way to reach them.
   */
  public async findWordLexemesForToken(tokenId: string): Promise<WordLexeme[]> {
    const word = await this.findWordForToken(tokenId);
    if (!word) return [];

    return this.wordLexemeRepository.find({
      order: { id: "ASC", lexeme: { translations: { id: "ASC" } } },
      relations: { lexeme: { translations: true } },
      where: { word: { id: word.id } },
    });
  }
}
