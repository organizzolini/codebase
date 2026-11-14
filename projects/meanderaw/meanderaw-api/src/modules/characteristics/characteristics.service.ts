import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
  Characteristic,
  CharacteristicValueCount,
} from "@codebase/meanderaw-db";

import type { CharacteristicEntity } from "./characteristics.entities";
import type { Repository } from "typeorm";

/** Reads the characteristic catalog and its per-value counts. */
@Injectable()
export class CharacteristicsService {
  // 🏗 Dependency Injection

  constructor(
    @InjectRepository(Characteristic)
    private readonly characteristicRepository: Repository<Characteristic>,
    @InjectRepository(CharacteristicValueCount)
    private readonly valueCountRepository: Repository<CharacteristicValueCount>,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Every catalog row by key, each with its stored value counts by value. */
  async findAll(): Promise<CharacteristicEntity[]> {
    const characteristics = await this.characteristicRepository.find({
      order: { key: "ASC" },
    });
    const counts = await this.valueCountRepository.find({
      order: { value: "ASC" },
    });

    return characteristics.map((characteristic) => ({
      category: characteristic.category,
      description: characteristic.description,
      documentationUrl: characteristic.documentationUrl,
      formula: characteristic.formula,
      id: characteristic.id,
      isPattern: characteristic.isPattern,
      key: characteristic.key,
      meanderCount: characteristic.meanderCount,
      name: characteristic.name,
      valueCounts: counts
        .filter(
          ({ characteristicId }) => characteristicId === characteristic.id,
        )
        .map(({ meanderCount, value }) => ({ meanderCount, value })),
      valueType: characteristic.valueType,
    }));
  }
}
