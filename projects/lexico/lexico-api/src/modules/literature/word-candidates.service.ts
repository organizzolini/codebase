import { Injectable } from "@nestjs/common";

import {
  InjectRepository,
  type Repository,
  Token,
  WordForm,
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
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Returns the word-form links of a token's word, each with its form's lexeme
   * and that lexeme's translations. A missing token, a punctuation token, and a
   * token with no word all return none.
   */
  public async findWordFormsForToken(tokenId: string): Promise<WordForm[]> {
    const token = await this.tokenRepository.findOne({
      relations: { word: true },
      where: { id: tokenId },
    });
    if (!token || token.isPunctuation || !token.word) {
      return [];
    }

    return this.wordFormRepository.find({
      relations: { form: { lexeme: { translations: true } } },
      where: { word: { id: token.word.id } },
    });
  }
}
