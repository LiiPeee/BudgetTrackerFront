type CepAddress = {
  street: string;
  city: string;
  state: string;
};

type ViaCepResponse = {
  logradouro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

function normalizeCep(value: string): string {
  return value.replace(/\D/g, "");
}

export function useCepLookup() {
  async function lookupCep(cepInput: string): Promise<CepAddress | null> {
    const cep = normalizeCep(cepInput);
    if (cep.length !== 8) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal });
      if (!response.ok) return null;

      const data = (await response.json()) as ViaCepResponse;
      if (data.erro) return null;

      return {
        street: data.logradouro ?? "",
        city: data.localidade ?? "",
        state: data.uf ?? "",
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  return { lookupCep };
}
