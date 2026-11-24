import { ViewColumn, ViewEntity } from "typeorm";

/** A view whose column types come from emitted decorator metadata. */
@ViewEntity({ name: "reflected_view" })
export class ErdReflectedView {
  @ViewColumn()
  count!: number;

  @ViewColumn()
  createdAt!: Date;

  @ViewColumn()
  label!: string;

  @ViewColumn()
  optionalLabel!: null | string;
}
