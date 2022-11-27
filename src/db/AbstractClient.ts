import { AppPrismaContext } from './context';

export abstract class AbstractClient {
  public abstract readonly TAG: string;
  public readonly publicFields: any;
  private _ctx: AppPrismaContext | null = null;

  protected get ctx() {
    if (this._ctx === null) throw new Error('Context is null');
    return this._ctx;
  }

  private set ctx(value: AppPrismaContext) {
    this._ctx = value;
  }

  public withContext(ctx: AppPrismaContext) {
    this._ctx = ctx;
    return this;
  }
}
