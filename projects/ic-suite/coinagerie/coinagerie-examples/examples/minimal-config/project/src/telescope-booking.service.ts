// A comment: words here never reach the glossary.
export class TelescopeBookingService {
  readonly slotLength = "a string that stays hidden";

  public reserve(nightSlots: number[]): number {
    return nightSlots.length;
  }
}
