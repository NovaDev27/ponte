import { requireOptionalNativeModule } from 'expo';

type PonteWearModule = {
  sync(data: Record<string, string | number | boolean>): Promise<boolean>;
};

// null no web, no iOS e nos builds antigos (até a versão 5), que não têm o módulo nativo.
export default requireOptionalNativeModule<PonteWearModule>('PonteWear');
