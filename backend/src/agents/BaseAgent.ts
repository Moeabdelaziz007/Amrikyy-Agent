export abstract class BaseAgent {
  readonly name: string;
  protected capabilities: string[];

  constructor(name: string, capabilities: string[]) {
    this.name = name;
    this.capabilities = capabilities;
  }

  abstract execute(request: any): Promise<any>;

  getCapabilities(): string[] {
    return this.capabilities;
  }
}
