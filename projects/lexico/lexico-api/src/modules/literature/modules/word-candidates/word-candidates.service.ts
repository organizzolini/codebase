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

  /** Returns a token's word-form links with each form's lexeme and translations, in stored order; none for a missing, punctuation or wordless token. */
  public async findWordFormsForToken(tokenId: string): Promise<WordForm[]> {
    const word = await this.findWordForToken(tokenId);
    if (!word) return [];

    return this.wordFormRepository.find({
      order: { form: { lexeme: { translations: { id: "ASC" } } }, id: "ASC" },
      relations: { form: { lexeme: { translations: true } } },
      where: { word: { id: word.id } },
    });
  }

  /** Returns the lexemes a token's word is the headword of, with translations in stored order; function words have no forms. */
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
