import { ESLint } from "eslint";

// Telas e regras não sabem em que aparelho estão: só os adaptadores nativos falam com o Capacitor.
const eslint = new ESLint({ cwd: process.cwd() });

async function errorsFor(filePath: string, code: string) {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((message) => message.ruleId === "no-restricted-imports").map((message) => message.message);
}

const capacitorImport = 'import { Preferences } from "@capacitor/preferences";\nexport const store = Preferences;\n';

describe("fronteiras de importação", () => {
  it.each(["src/pages/Dashboard.tsx", "src/hooks/use-anything.ts", "src/platform/web/token-store.ts", "src/platform/ports/token-store.ts"])(
    "%s não pode importar o Capacitor",
    async (filePath) => {
      expect(await errorsFor(filePath, capacitorImport)).toHaveLength(1);
    },
  );

  it("os adaptadores nativos podem", async () => {
    expect(await errorsFor("src/platform/native/token-store.ts", capacitorImport)).toEqual([]);
  });

  it("importações comuns continuam livres", async () => {
    expect(await errorsFor("src/pages/Dashboard.tsx", 'import { useState } from "react";\nexport const x = useState;\n')).toEqual([]);
  });
});
