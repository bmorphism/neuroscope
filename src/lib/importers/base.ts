import { NeuroscopeNetwork, ValidationResult } from '../types/network';
import { NetworkValidator } from '../types/validator';

export interface NetworkImporter {
  fromFile(path: string): Promise<NeuroscopeNetwork>;
  validate(network: NeuroscopeNetwork): ValidationResult;
}

export abstract class BaseImporter implements NetworkImporter {
  protected validator: NetworkValidator;

  constructor() {
    this.validator = new NetworkValidator();
  }

  abstract fromFile(path: string): Promise<NeuroscopeNetwork>;

  validate(network: NeuroscopeNetwork): ValidationResult {
    return this.validator.validate(network);
  }
} 