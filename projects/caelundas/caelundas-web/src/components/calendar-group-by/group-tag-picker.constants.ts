import { z } from "zod";

export const NOTHING = (): void => {};

export const TAG_IDS = z.array(z.string());
