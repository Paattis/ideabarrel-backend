import { PrismaContext } from './context';

export abstract class AbstractClient {
  public abstract readonly TAG: string;
  public readonly publicFields: any;
  private _ctx: PrismaContext | null = null;

  protected get ctx() {
    if (this._ctx === null) throw new Error('Context is null');
    return this._ctx;
  }

  private set ctx(value: PrismaContext) {
    this._ctx = value;
  }

  public withContext(ctx: PrismaContext) {
    this._ctx = ctx;
    return this;
  }
}
